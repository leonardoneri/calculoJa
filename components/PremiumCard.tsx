import Link from "next/link";

export default function PremiumCard() {
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Versão Premium</h2>
      <p className="text-gray-300 mb-4">
        Acesse recursos exclusivos e remova anúncios com nossa versão premium.
      </p>
      <Link 
        href="/premium"
        className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-200"
      >
        Saiba Mais
      </Link>
    </div>
  );
} 