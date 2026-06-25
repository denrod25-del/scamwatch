/** useActionState shape for the magic-link sign-in form. */
export interface LoginState {
  ok: boolean;
  sent?: boolean;
  error?: string;
}
