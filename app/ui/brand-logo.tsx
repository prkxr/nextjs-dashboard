import { lusitana } from '@/app/ui/fonts';

export default function BrandLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="h-12 w-12 rotate-[15deg]"
      >
        <circle cx="24" cy="24" r="20" className="fill-white/20" />
        <path
          d="M24 8L28.5 19.5L40 24L28.5 28.5L24 40L19.5 28.5L8 24L19.5 19.5L24 8Z"
          className="fill-white"
        />
      </svg>
      <p className="text-[44px]">Nova</p>
    </div>
  );
}
