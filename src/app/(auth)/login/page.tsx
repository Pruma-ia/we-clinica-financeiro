import GoogleButton from './google-button'

export default function LoginPage() {
  return (
    <section
      role="main"
      aria-labelledby="login-heading"
      className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/30 p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500 ease-out"
    >
      <div className="flex flex-col items-center gap-2 mb-6">
        <span className="text-[28px] font-bold font-heading leading-tight text-[#0D1B4B]">
          We Clínica
        </span>
        <span className="text-sm font-normal font-sans text-[#0D1B4B]/70">
          Sistema Financeiro
        </span>
      </div>
      <h1
        id="login-heading"
        className="text-2xl font-bold font-heading leading-snug text-[#0D1B4B] text-center mb-2"
      >
        Bem-vindo de volta
      </h1>
      <p className="text-base font-normal font-sans leading-normal text-slate-600 text-center mb-8">
        Acesse o painel financeiro da clínica com sua conta Google autorizada.
      </p>
      <GoogleButton />
      <p className="mt-4 text-sm font-normal font-sans text-slate-500 text-center">
        Apenas usuários autorizados pela administração podem acessar.
      </p>
    </section>
  )
}
