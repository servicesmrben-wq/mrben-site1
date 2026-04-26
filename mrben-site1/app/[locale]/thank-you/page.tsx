import { Link } from '@/navigation';
import { CheckCircle } from 'lucide-react';

export default async function ThankYouPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const t = {
    title: locale === 'en' ? 'Thank You!' : 'Merci !',
    message: locale === 'en' 
      ? 'Your request has been sent successfully. We will get back to you shortly.' 
      : 'Votre demande a été envoyée avec succès. Nous vous contacterons sous peu.',
    button: locale === 'en' ? 'Back to Home' : "Retour à l'accueil"
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm p-8 text-center ring-1 ring-zinc-100">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-4">
          {t.title}
        </h1>
        <p className="text-zinc-600 mb-8 leading-relaxed">
          {t.message}
        </p>
        <Link 
          href="/" 
          className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors"
        >
          {t.button}
        </Link>
      </div>
    </div>
  );
}
