"use client";

import { useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Camera, UserRound } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import type { Position } from "@/types/db";
import { LA_POSITION_MAP } from "@/app/feedback/constants";
import ContactUs from "@/components/ContactUs";
import { useTheme } from "next-themes";

export default function Settings() {
  const { data: session, isPending } = authClient.useSession();
  const { data: positions } = useSWR<Position[]>("/api/la/self", fetcher, {
    suspense: true,
    fallbackData: [],
  });
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  if (!session || isPending) return <></>;

  const imageUrl = preview ?? session.user.image;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/settings/avatar", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { url } = await res.json<{ url: string }>();
      await authClient.updateUser({ image: url });
      setPreview(null);
      toast.success("Changed headshot!");
    } else {
      toast.error(await res.text());
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 px-8 py-10">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="space-y-1">
        <span className="font-medium text-lg">I am...</span>
        <p>{session.user.name}</p>
        <p>{session.user.email}</p>
      </div>

      <div className="space-y-1">
        <span className="font-medium text-lg">Courses</span>
        {positions && positions.length > 0 ? (
          <ul className="space-y-1">
            {positions.map((p) => (
              <li key={`${p.course_name}-${p.position}`}>
                {p.course_name} ({LA_POSITION_MAP.get(p.position) ?? p.position}
                )
              </li>
            ))}
          </ul>
        ) : (
          <p>No courses listed.</p>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Please <ContactUs /> if inaccurate information has not resolved itself
          within 24 hours.
        </p>
      </div>

      <div className="space-y-2">
        <label className="font-medium text-lg">Headshot</label>
        <p className="text-xs text-muted-foreground">
          This image will be used to help identify you for
          observations/feedback. Please choose a professional headshot.
        </p>
        <div className="flex items-center gap-6 mt-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative h-24 w-24 overflow-hidden rounded-sm border"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile Picture"
                width={300}
                height={300}
                className="h-full w-full"
              />
            ) : (
              <UserRound className="h-full w-full" strokeWidth={1} />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </button>
          <div className="space-x-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              {imageUrl ? "Replace Image" : "Upload Image"}
            </Button>
            {preview && (
              <Button size="sm" onClick={handleUpload}>
                Save
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          JPEG, PNG, or WebP. Max 2 MB. The site will automatically crop/zoom
          your upload for you, but a square image is the easiest way to get it
          right!
        </p>
      </div>

      <div className="space-y-2">
        <label className="font-medium text-lg">Appearance</label>
        <div className="flex gap-1 rounded-lg border p-1 w-fit">
          {([
            { value: "light", emoji: "☀️" },
            { value: "system", emoji: "💻" },
            { value: "dark", emoji: "🌙" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`rounded-md px-3 py-1.5 text-lg transition-colors ${
                theme === opt.value
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              }`}
              title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
            >
              {opt.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
