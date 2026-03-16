"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = () => {
  const pathname = usePathname();

  // Skip rendering on homepage
  if (pathname === "/") return null;

  const paths = pathname.split("/").filter(Boolean);

  const breadcrumbs = paths.map((path, index) => {
    const href = "/" + paths.slice(0, index + 1).join("/");
    const label = path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { href, label };
  });

  return (
    <nav className="h-11 flex items-center px-4 md:px-8 lg:px-12 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl w-full mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-black transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          </li>

          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-black font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
