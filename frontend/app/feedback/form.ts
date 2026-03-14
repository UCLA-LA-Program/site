import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { feedbackFormSchema, defaultValues } from "./schema";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export { fieldContext, formContext, useFieldContext };

export const { useAppForm, useTypedAppFormContext } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

// Typed wrapper: options are used only for type inference, not at runtime.
// Components inside <form.AppForm> can call this to access the form.
export function useFormContext() {
  return useTypedAppFormContext({
    defaultValues,
    validators: { onSubmit: feedbackFormSchema },
    onSubmit: async () => {},
  });
}

export { defaultValues, feedbackFormSchema };
