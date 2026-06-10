import Image from "next/image";

const WA_NUMBER = "27624623288";
const WA_HREF = `https://wa.me/${WA_NUMBER}`;

export const metadata = {
  title: "Maintenance — Body Pharm Labs",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="relative w-48 h-16 mb-10">
        <Image
          src="/images/logo.png"
          alt="Body Pharm Labs"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Heading */}
      <h1 className="text-5xl font-semibold text-black tracking-tight mb-5">
        Maintenance
      </h1>

      {/* Sub-copy */}
      <p className="text-gray-400 text-base max-w-xs leading-relaxed mb-8">
        We&apos;re making improvements. For enquiries and orders reach us on WhatsApp.
      </p>

      {/* WhatsApp CTA */}
      <a
        href={WA_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-green-500 text-green-600 font-semibold text-sm bg-white hover:bg-green-50 transition-colors"
      >
        {/* WhatsApp icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.486a.5.5 0 0 0 .614.614l5.604-1.47A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75A9.74 9.74 0 0 1 6.51 20.1l-.36-.214-3.728.978.996-3.641-.235-.375A9.714 9.714 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
        </svg>
        WhatsApp
      </a>
    </div>
  );
}
