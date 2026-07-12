import Link from "next/link";

export const Footer = () => {
  const linkStyles = "text-sm transition duration-150 ease hover:text-white";
  const liStyles = "text-color-secondary my-1.5";

  return (
    <footer className="px-6 py-24 border-t border-solid pointer-events-auto bg-background-secondary border-[#242424]">
      <nav className="flex flex-wrap justify-around gap-5 mx-auto max-w-screen-2xl">
        <div className="w-full max-w-xs">
          <h2 className="my-3 text-sm font-medium">Products</h2>
          <ul className="grid grid-cols-2">
            <li className={liStyles}>
              <Link href="/frontpage" className={linkStyles}>
                Homepage Featured
              </Link>
            </li>
            <li className={liStyles}>
              <Link href="/automated-collection" className={linkStyles}>
                Automated
              </Link>
            </li>
            <li className={liStyles}>
              <Link href="/hydrogen" className={linkStyles}>
                Hydrogen Snowboards
              </Link>
            </li>
            <li className={liStyles}>
              <Link href="/products" className={linkStyles}>
                All Products
              </Link>
            </li>
          </ul>
        </div>
        <div className="w-full max-w-xs">
          <h2 className="my-3 text-sm font-medium">Assistance</h2>
          <ul className="grid grid-cols-2">
            <li className={liStyles}>
              <Link href="/faqs" className={linkStyles}>
                FAQs
              </Link>
            </li>
            <li className={liStyles}>
              <Link href="/blogs" className={linkStyles}>
                Journal & Blog
              </Link>
            </li>
            <li className={liStyles}>
              <Link href="/faqs" className={linkStyles}>
                Returns Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className="w-full max-w-xs">
          <h2 className="my-3 text-sm font-medium">LOOPGRO COLLECTIVE LLP by nikhil</h2>
          <ul className="grid grid-cols-2">
            <li className={liStyles}>
              <Link
                href="https://www.linkedin.com/company/loopgro/"
                target="_blank"
                className={linkStyles}
              >
                Portfolio
              </Link>
            </li>
            <li className={liStyles}>
              <Link
                href="https://www.linkedin.com/company/loopgro/"
                target="_blank"
                className={linkStyles}
              >
                LinkedIn
              </Link>
            </li>
            <li className={liStyles}>
              <Link
                href="https://github.com/n4rnikhil"
                target="_blank"
                className={linkStyles}
              >
                GitHub
              </Link>
            </li>
            <li className={liStyles}>
              <Link
                href="https://medium.com"
                target="_blank"
                className={linkStyles}
              >
                Medium
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </footer>
  );
};
