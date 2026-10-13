import "server-only";

import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { renderToStaticMarkup } from "react-dom/server";

// ---------------------------------------------------------------------------
// Email renderer
//
// An email is authored once as a list of blocks, then rendered twice: to HTML
// for `text/html` and to plain text for the `text/plain` alternative. A single
// source means the text fallback can't drift out of sync with the HTML.
//
// The HTML comes out of @react-email/components rather than hand-written
// tables — its primitives carry the client workarounds that matter (Outlook
// conditional wrapper tables around Container, the MSO letter-spacing hack in
// Button, the whitespace padding trick in Preview). Only the components are
// imported, not @react-email/render: that package pulls in html-to-text and
// js-beautify (~130 KB gzipped) for its plain-text and pretty modes, which is
// far too much for a Worker bundle. Rendering with react-dom/server directly
// costs nothing extra since Next.js already bundles it.
// ---------------------------------------------------------------------------

/**
 * `htmlOnly` marks affordances that only exist in the HTML rendering — a
 * "click the button below" line, or a copy-paste fallback for a link the text
 * version already prints inline. They are dropped from the text alternative so
 * it doesn't read as duplicated.
 */
type Common = { htmlOnly?: boolean };

export type EmailBlock = Common &
  (
    | { type: "heading"; text: string }
    | { type: "text"; text: string; muted?: boolean }
    | { type: "button"; label: string; url: string }
    | { type: "url"; url: string }
    | {
        type: "note";
        tone: "info" | "success" | "warning";
        title?: string;
        text: string;
      }
    | { type: "facts"; items: { label: string; value: string }[] }
    | { type: "bullets"; items: string[] }
    | { type: "rule" }
  );

export type EmailContent = {
  subject: string;
  /** Snippet shown after the subject in most inbox previews. */
  preheader: string;
  blocks: EmailBlock[];
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const C = {
  page: "#f1f4f8",
  card: "#ffffff",
  text: "#1f2933",
  muted: "#5b6875",
  border: "#e2e8f0",
  brand: "#2774ae",
  brandDark: "#005587",
};

const TONES = {
  info: { bg: "#eef4fb", border: "#2774ae", text: "#1c4f7c" },
  success: { bg: "#eaf7ef", border: "#2f855a", text: "#1f5c3f" },
  warning: { bg: "#fdf5e3", border: "#b7791f", text: "#7a5410" },
} as const;

const SITE_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "https://www.laprogramucla.com";

const FOOTER_TEXT =
  "You received this email because of your involvement with the UCLA Learning Assistant Program.";

/**
 * Dark-mode and small-screen rules. Every block also carries inline
 * light-mode styles, so clients that strip <style> (notably older Outlook)
 * still render correctly.
 */
const CSS = `
@media (prefers-color-scheme: dark) {
  .page { background:#0e1319 !important; }
  .card { background:#181e26 !important; border-color:#2a323d !important; }
  .heading, .body, .fact-value { color:#e8edf3 !important; }
  .muted, .fact-label, .footer { color:#9aa7b5 !important; }
  .fact { border-bottom-color:#2a323d !important; }
  .rule { border-color:#2a323d !important; }
  .link { color:#8ec5f0 !important; }
  .wordmark { color:#e8edf3 !important; }
}
@media only screen and (max-width: 620px) {
  .pad { padding-left:24px !important; padding-right:24px !important; }
  .heading { font-size:20px !important; line-height:28px !important; }
}
`;

// ---------------------------------------------------------------------------
// URL safety
// ---------------------------------------------------------------------------

/**
 * Only http(s) URLs are allowed into an `href`, so a value that came from user
 * input can never turn into a `javascript:` or `data:` link. React escapes text
 * and attribute values but does not restrict URL schemes.
 */
function safeUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "#";
    return parsed.toString();
  } catch {
    return "#";
  }
}

// ---------------------------------------------------------------------------
// HTML blocks
// ---------------------------------------------------------------------------

function HtmlBlock({ block }: { block: EmailBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <Heading
          as="h1"
          className="heading"
          style={{
            margin: "0 0 16px",
            fontFamily: FONT,
            fontSize: "22px",
            lineHeight: "30px",
            fontWeight: 600,
            color: C.text,
          }}
        >
          {block.text}
        </Heading>
      );

    case "text":
      return (
        <Text
          className={block.muted ? "muted" : "body"}
          style={{
            margin: "0 0 16px",
            fontFamily: FONT,
            fontSize: block.muted ? "14px" : "16px",
            lineHeight: block.muted ? "22px" : "25px",
            color: block.muted ? C.muted : C.text,
          }}
        >
          {block.text}
        </Text>
      );

    case "button":
      return (
        <Section style={{ margin: "8px 0 24px" }}>
          <Button
            href={safeUrl(block.url)}
            style={{
              backgroundColor: C.brand,
              borderRadius: "8px",
              padding: "14px 30px",
              fontFamily: FONT,
              fontSize: "16px",
              lineHeight: "20px",
              fontWeight: 600,
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            {block.label}
          </Button>
        </Section>
      );

    case "url":
      return (
        <Text
          className="muted"
          style={{
            margin: "0 0 16px",
            fontFamily: FONT,
            fontSize: "13px",
            lineHeight: "20px",
            color: C.muted,
            wordBreak: "break-all",
          }}
        >
          <Link
            className="link"
            href={safeUrl(block.url)}
            style={{ color: C.brandDark, textDecoration: "underline" }}
          >
            {block.url}
          </Link>
        </Text>
      );

    case "note": {
      const tone = TONES[block.tone];
      return (
        <Section
          className="note"
          style={{
            margin: "0 0 20px",
            backgroundColor: tone.bg,
            borderLeft: `4px solid ${tone.border}`,
            borderRadius: "6px",
            padding: "14px 18px",
          }}
        >
          {block.title && (
            <Text
              style={{
                margin: "0 0 4px",
                fontFamily: FONT,
                fontSize: "15px",
                lineHeight: "23px",
                fontWeight: 600,
                color: tone.text,
              }}
            >
              {block.title}
            </Text>
          )}
          <Text
            style={{
              margin: 0,
              fontFamily: FONT,
              fontSize: "15px",
              lineHeight: "23px",
              color: tone.text,
            }}
          >
            {block.text}
          </Text>
        </Section>
      );
    }

    case "facts":
      // Each Row is its own table, so the label column is given a fixed width
      // to keep values aligned down the list.
      return (
        <Section style={{ margin: "0 0 24px" }}>
          {block.items.map((item) => (
            <Row key={item.label}>
              <Column
                className="fact fact-label"
                width="35%"
                valign="top"
                style={{
                  padding: "9px 12px 9px 0",
                  borderBottom: `1px solid ${C.border}`,
                  fontFamily: FONT,
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  color: C.muted,
                }}
              >
                {item.label}
              </Column>
              <Column
                className="fact fact-value"
                valign="top"
                style={{
                  padding: "9px 0",
                  borderBottom: `1px solid ${C.border}`,
                  fontFamily: FONT,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: C.text,
                }}
              >
                {item.value}
              </Column>
            </Row>
          ))}
        </Section>
      );

    case "bullets":
      return (
        <ul
          className="body"
          style={{
            margin: "0 0 20px",
            paddingLeft: "22px",
            fontFamily: FONT,
            fontSize: "16px",
            lineHeight: "25px",
            color: C.text,
          }}
        >
          {block.items.map((item) => (
            <li key={item} style={{ margin: "0 0 6px" }}>
              {item}
            </li>
          ))}
        </ul>
      );

    case "rule":
      return (
        <Hr
          className="rule"
          style={{ margin: "0 0 24px", borderColor: C.border }}
        />
      );
  }
}

function EmailDocument({ content }: { content: EmailContent }) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <title>{content.subject}</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <Preview>{content.preheader}</Preview>
      <Body
        className="page"
        style={{
          margin: 0,
          padding: 0,
          width: "100%",
          backgroundColor: C.page,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container
          style={{
            width: "600px",
            maxWidth: "600px",
            padding: "32px 12px 40px",
          }}
        >
          <Section style={{ padding: "0 0 20px" }}>
            <Link
              href={safeUrl(SITE_URL)}
              style={{ color: C.text, textDecoration: "none" }}
            >
              <Img
                src={safeUrl(`${SITE_URL}/logo.png`)}
                width="44"
                height="44"
                alt="UCLA LA Program"
                style={{ display: "inline-block", verticalAlign: "middle" }}
              />
              <span
                className="wordmark"
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  paddingLeft: "12px",
                  fontFamily: FONT,
                  fontSize: "17px",
                  lineHeight: "24px",
                  fontWeight: 600,
                  color: C.text,
                }}
              >
                UCLA Learning Assistant Program
              </span>
            </Link>
          </Section>

          <Section
            className="card"
            style={{
              backgroundColor: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
            }}
          >
            <Section className="pad" style={{ padding: "32px 36px 12px" }}>
              {content.blocks.map((block, index) => (
                <HtmlBlock key={index} block={block} />
              ))}
            </Section>
          </Section>

          <Section className="pad" style={{ padding: "24px 8px 0" }}>
            <Text
              className="footer"
              style={{
                margin: "0 0 6px",
                fontFamily: FONT,
                fontSize: "12px",
                lineHeight: "19px",
                color: C.muted,
              }}
            >
              {FOOTER_TEXT}
            </Text>
            <Text
              className="footer"
              style={{
                margin: 0,
                fontFamily: FONT,
                fontSize: "12px",
                lineHeight: "19px",
                color: C.muted,
              }}
            >
              <Link
                className="link"
                href={safeUrl(SITE_URL)}
                style={{ color: C.brandDark, textDecoration: "underline" }}
              >
                laprogramucla.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Plain text blocks
// ---------------------------------------------------------------------------

/** Soft-wrap prose at 72 columns, the conventional width for plain text mail. */
function wrap(value: string, width = 72, indent = "") {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(indent + line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(indent + line);
  return lines.join("\n");
}

function textBlock(block: EmailBlock): string {
  switch (block.type) {
    case "heading":
      return `${block.text}\n${"=".repeat(Math.min(block.text.length, 72))}`;

    case "text":
      return wrap(block.text);

    case "button":
      return `${block.label}:\n${block.url}`;

    case "url":
      return block.url;

    case "note":
      return [
        block.title ? `[ ${block.title} ]` : null,
        wrap(block.text, 70, "  "),
      ]
        .filter(Boolean)
        .join("\n");

    case "facts": {
      const width = Math.max(...block.items.map((item) => item.label.length));
      return block.items
        .map((item) => `${item.label.padEnd(width)}  ${item.value}`)
        .join("\n");
    }

    case "bullets":
      return block.items.map((item) => wrap(`- ${item}`, 70)).join("\n");

    case "rule":
      return "-".repeat(72);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/** The doctype email clients expect, and the one @react-email/render emits. */
const DOCTYPE =
  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

export function renderEmail(content: EmailContent): RenderedEmail {
  const markup = renderToStaticMarkup(<EmailDocument content={content} />)
    // React 19 can hoist resource preload hints into <head>; they're useless
    // in an email and confuse some clients.
    .replace(/<link\b[^>]*rel="preload"[^>]*>/gi, "")
    .replace(/<!DOCTYPE.*?>/, "");

  const text = [
    "UCLA Learning Assistant Program",
    "",
    ...content.blocks.filter((block) => !block.htmlOnly).map(textBlock),
    "",
    "-".repeat(72),
    wrap(FOOTER_TEXT),
    SITE_URL,
    "",
  ]
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");

  return { subject: content.subject, html: `${DOCTYPE}${markup}`, text };
}
