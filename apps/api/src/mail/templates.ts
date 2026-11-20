export type MailLocale = 'en' | 'fr' | 'ar';
export type MailKind = 'register' | 'reset' | 'exists';

const T = {
  en: {
    register: {
      subject: 'Your LifeOS verification code',
      intro: 'Use this code to create your LifeOS account:',
      button: 'Verify email',
    },
    reset: {
      subject: 'Reset your LifeOS password',
      intro: 'Use this code to reset your password:',
      button: 'Reset password',
    },
    exists: {
      subject: 'You already have a LifeOS account',
      intro:
        'Someone tried to create a LifeOS account with this email, but one already exists. If that was you, sign in or reset your password.',
      button: 'Sign in',
    },
    expires: 'The code expires in 10 minutes.',
    ignore: "If you didn't request this, you can safely ignore this email.",
  },
  fr: {
    register: {
      subject: 'Votre code de vérification LifeOS',
      intro: 'Utilisez ce code pour créer votre compte LifeOS :',
      button: "Vérifier l'e-mail",
    },
    reset: {
      subject: 'Réinitialisez votre mot de passe LifeOS',
      intro: 'Utilisez ce code pour réinitialiser votre mot de passe :',
      button: 'Réinitialiser le mot de passe',
    },
    exists: {
      subject: 'Vous avez déjà un compte LifeOS',
      intro:
        "Quelqu'un a essayé de créer un compte LifeOS avec cet e-mail, mais un compte existe déjà. Si c'était vous, connectez-vous ou réinitialisez votre mot de passe.",
      button: 'Se connecter',
    },
    expires: 'Le code expire dans 10 minutes.',
    ignore:
      "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.",
  },
  ar: {
    register: {
      subject: 'رمز التحقق الخاص بك في LifeOS',
      intro: 'استخدم هذا الرمز لإنشاء حسابك في LifeOS:',
      button: 'تأكيد البريد الإلكتروني',
    },
    reset: {
      subject: 'إعادة تعيين كلمة مرور LifeOS',
      intro: 'استخدم هذا الرمز لإعادة تعيين كلمة المرور:',
      button: 'إعادة تعيين كلمة المرور',
    },
    exists: {
      subject: 'لديك حساب في LifeOS بالفعل',
      intro:
        'حاول شخص ما إنشاء حساب في LifeOS بهذا البريد الإلكتروني، لكن الحساب موجود بالفعل. إذا كنت أنت، سجّل الدخول أو أعد تعيين كلمة المرور.',
      button: 'تسجيل الدخول',
    },
    expires: 'ينتهي الرمز خلال 10 دقائق.',
    ignore: 'إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.',
  },
} as const;

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function renderMail(args: {
  kind: MailKind;
  locale: MailLocale;
  webOrigin: string;
  email: string;
  code?: string;
}) {
  const { kind, locale, webOrigin, email, code } = args;
  const t = T[locale];
  const copy = t[kind];

  // Register/reset links open the verify page with the code prefilled.
  const base = `${webOrigin}/${locale}`;
  const url =
    kind === 'exists'
      ? new URL(`${base}/login`)
      : new URL(
          `${base}/${kind === 'register' ? 'register' : 'forgot-password'}/verify`,
        );
  if (kind !== 'exists' && code) {
    url.searchParams.set('email', email);
    url.searchParams.set('code', code);
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const text = [
    copy.intro,
    code ? `\n${code}\n` : '',
    code ? t.expires : '',
    url.toString(),
    `\n${t.ignore}`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `<div dir="${dir}" style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
  <h1 style="font-size:24px;color:#7c3aed;margin:0 0 16px">LifeOS</h1>
  <p style="font-size:16px;line-height:1.5">${esc(copy.intro)}</p>
  ${code ? `<p dir="ltr" style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0;text-align:center">${esc(code)}</p><p style="font-size:14px;color:#5b6776">${esc(t.expires)}</p>` : ''}
  <p style="margin:24px 0"><a href="${esc(url.toString())}" style="background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:12px;display:inline-block">${esc(copy.button)}</a></p>
  <p style="font-size:14px;color:#5b6776">${esc(t.ignore)}</p>
</div>`;

  return { subject: copy.subject, text, html };
}
