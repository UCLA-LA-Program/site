import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { feedbackFormSchema, defaultValues } from "./schema";

const { fieldContext, formContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

export { defaultValues, feedbackFormSchema };
