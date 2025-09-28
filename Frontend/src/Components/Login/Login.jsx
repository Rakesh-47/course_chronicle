import React, { useEffect, useContext } from "react";
import { Assets } from "../../Assets/Assets";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../Context/AuthContext";
import * as motion from "motion/react-client";

export default function Login() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [formData, setFormData] = React.useState({
    Email: "",
    Password: "",
  });

  function handleChange(e) {
    setFormData((preFormData) => {
      return {
        ...preFormData,
        [e.target.name]: e.target.value,
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let response;
    try {
      response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error occurred, please try again later");
      }
      const responseData = await response.json();
      auth.login(
        responseData.userId,
        responseData.token,
        responseData.credit,
        responseData.refCode
      );
      console.log(responseData);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed top-0 left-0 right-0 bottom-0 z-20 backdrop-blur-xs bg-black/30 flex justify-center items-center"
      >
        <form
          onSubmit={handleSubmit}
          method="POST"
          className="bg-white relative p-10 rounded-xl tex-slate-500"
        >
          <h1 className="text-2xl font-medium text-center text-neutral-700">
            Login
          </h1>
          <p className="text-sm">Welcome back! Please sign in to continue</p>
          <div className="border border-gray-300 gap-2 px-6 py-2 flex items-center rounded-full mt-4">
            <img src={Assets.email_icon} alt="" />
            <input
              id="Email"
              name="Email"
              type="email"
              value={formData.Email}
              placeholder="Email"
              onChange={handleChange}
              required
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
          <div className="border border-gray-300 gap-2 px-6 py-2 flex items-center rounded-full mt-4">
            <img src={Assets.lock_icon} alt="" />
            <input
              id="Password"
              name="Password"
              type="password"
              value={formData.Password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
          <p className="text-sm text-blue-600 my-4 cursor-pointer">
            Forget password?
          </p>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Login
          </button>
          <img
            onClick={() => {
              navigate("/");
            }}
            src={Assets.cross_icon}
            alt=""
            className="absolute top-5 right-5 cursor-pointer"
          />
        </form>
      </motion.div>
    </>
  );
}
