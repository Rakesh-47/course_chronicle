import { useState, useContext, useEffect } from "react";
import AuthContext from "../../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Assets } from "../../assets/Assets";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("auth.refCode", auth.refCode);
  console.log("auth.credit", auth.credit);
  console.log(JSON.parse(localStorage.getItem("userData")));
  useEffect(() => {
    console.log("Updated refCode:", auth.refCode);
  }, [auth.refCode]);

  // Copy referral code handler
  const handleCopy = () => {
    if (auth.refCode) {
      navigator.clipboard.writeText(auth.refCode);
      alert("Referral code copied!");
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between p-4 mx-auto">
        <Link to="/">
          <img src={Assets.logo} className="h-8" alt="Flowbite Logo" />
        </Link>

        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {auth.token ? (
            <>
              <div className="flex items-center space-x-2 bg-gray-800 text-white px-3 py-1 mr-2 rounded-lg">
                <Wallet size={18} className="text-blue-400" />
                <span className="text-sm font-medium">
                  {auth.credit ? auth.credit : ""} Credits
                </span>
                {auth.refCode && (
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-gray-300">
                      Ref Code:{" "}
                      <span className="font-semibold text-white">
                        {auth.refCode}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded focus:outline-none"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={() => auth.logout()}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signup">
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 mr-1.5 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Signup
                </button>
              </Link>
              <Link to="/login">
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Login
                </button>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } items-center justify-between w-full md:flex md:w-auto md:order-1`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <a
                href="/"
                className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/upload"
                className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Upload
              </a>
            </li>
            <li>
              <a
                href="/aboutUs"
                className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/subscription"
                className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Subscription
              </a>
            </li>
            <li>
              <a
                href="/papers"
                className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Papers
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
