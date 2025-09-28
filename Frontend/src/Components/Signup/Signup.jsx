import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../../Context/AuthContext";
import { Spinner, Alert } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { Assets } from "../../assets/Assets";
import * as motion from "motion/react-client";

export default function Signup() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [refOpen, setRefOpen] = useState(false);

  const [isLoginMode, setIsLoginMode] = useState(false);

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Password: "",
    referralCode: ""
  });

  const [selectedCourses, setSelectedCourses] = useState([""]);
  const [coursesData, setCoursesData] = useState([]);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCoursesData(data))
      .catch((error) => console.error("Error loading courses:", error));
  }, []);

  function handleChange(e) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
  }

  const handleCourseChange = (index, e) => {
    const courseId = e.target.value;
    const newCourses = [...selectedCourses];
    newCourses[index] = courseId;
    setSelectedCourses(newCourses);

    if (
      courseId &&
      index === newCourses.length - 1 &&
      newCourses.length < 5
    ) {
      setSelectedCourses((prevCourses) => [...prevCourses, ""]);
    }
  };
  
  // --- NEW HANDLER to switch between modes ---
  const switchModeHandler = () => {
    setIsLoginMode((prevMode) => !prevMode);
    // Reset form data when switching modes
    setFormData({ Name: "", Email: "", Password: "", referralCode: "" });
    setMessage("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let url;
    let payload;

    // --- UPDATED LOGIC to handle both Login and Signup ---
    if (isLoginMode) {
      url = "/api/login";
      payload = {
        Email: formData.Email,
        Password: formData.Password,
      };
    } else {
      url = "/api/signup";
      payload = {
        ...formData,
        enrolledCourses: selectedCourses.filter((id) => id),
      };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Use the error message from the backend if it exists
        throw new Error(responseData.message || "An error occurred.");
      }

      auth.login(
        responseData.userId,
        responseData.token,
        responseData.credit,
        responseData.refCode
      );
      
      setMessage(isLoginMode ? "Successfully Logged In" : "Successfully Signed Up");
      setAlertType("blue");
      
      // Redirect to home page on successful login/signup
      setTimeout(() => navigate("/"), 1500);

    } catch (error) {
      setMessage(error.message || "An error occurred, try again later");
      setAlertType("red");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  }

  return (
    <>
      {message && (
        <Alert
          color={alertType}
          className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50"
        >
          {message}
        </Alert>
      )}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed top-0 left-0 right-0 bottom-0 z-20 p-10 flex justify-center items-center ${
          loading ? "backdrop-blur-md" : "backdrop-blur-xs"
        } bg-black/30`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white relative p-10 rounded-xl text-slate-500 w-96"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            <h1 className="text-2xl font-medium text-center text-neutral-700">
              {/* --- Conditional Title --- */}
              {isLoginMode ? 'Login' : 'Sign up'}
            </h1>
            <p className="text-sm text-center mb-4">
              {/* --- Conditional Subtitle --- */}
              {isLoginMode ? 'Welcome back! Please login to continue' : 'Welcome! Please sign up to continue'}
            </p>

            {/* --- Conditional Rendering for Name Field (Signup only) --- */}
            {!isLoginMode && (
              <div className="border border-gray-300 flex items-center gap-2 px-4 py-2 rounded-full mt-4">
                <img src={Assets.email_icon} alt="User Icon" />
                <input
                  id="Name"
                  name="Name"
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.Name}
                  onChange={handleChange}
                  className="w-full outline-none placeholder-gray-400"
                />
              </div>
            )}

            <div className="border border-gray-300 flex items-center gap-2 px-4 py-2 rounded-full mt-4">
              <img src={Assets.email_icon} alt="Email Icon" />
              <input
                id="Email"
                name="Email"
                type="email"
                required
                placeholder="Email"
                value={formData.Email}
                onChange={handleChange}
                className="w-full outline-none placeholder-gray-400"
              />
            </div>

            <div className="border border-gray-300 flex items-center gap-2 px-4 py-2 rounded-full mt-4">
              <img src={Assets.lock_icon} alt="Lock Icon" />
              <input
                name="Password"
                type="password"
                required
                placeholder="Password"
                value={formData.Password}
                onChange={handleChange}
                className="w-full outline-none placeholder-gray-400"
              />
            </div>

            {/* --- Conditional Rendering for Referral and Courses (Signup only) --- */}
            {!isLoginMode && (
              <>
                {refOpen && (
                  <div className="border border-gray-300 flex items-center gap-2 px-4 py-2 rounded-full mt-4">
                    <img src={Assets.email_icon} alt="Referral Icon" />
                    <input
                      id="referralCode"
                      name="referralCode"
                      type="text"
                      placeholder="Referral Code (Optional)"
                      value={formData.referralCode}
                      onChange={handleChange}
                      className="w-full outline-none placeholder-gray-400"
                    />
                  </div>
                )}

                <div className="mt-4">
                  {selectedCourses.map((courseId, index) => {
                    const availableCourses = coursesData.filter(
                      (c) => !selectedCourses.some((id, i) => i !== index && id === c._id)
                    );
                    return (
                      <div key={index} className="mt-2">
                        <select
                          value={courseId}
                          onChange={(e) => handleCourseChange(index, e)}
                          className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none"
                        >
                          <option value="">Select a course</option>
                          {availableCourses.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.code} - {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
                
                <p
                  onClick={() => setRefOpen(true)}
                  className="text-sm text-blue-600 my-4 cursor-pointer text-center"
                >
                  Have a referral code?
                </p>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-white font-semibold shadow-md hover:bg-indigo-500 mt-4"
            >
              {/* --- Conditional Button Text --- */}
              {loading ? <Spinner className="h-5 w-5" /> : (isLoginMode ? 'Login' : 'Sign Up')}
            </button>

            {/* --- NEW Mode Switcher --- */}
            <p
              onClick={switchModeHandler}
              className="text-sm text-center mt-4 cursor-pointer text-neutral-600 hover:text-indigo-600"
            >
              {isLoginMode
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"}
            </p>
          </div>

          <img
            onClick={() => navigate("/")}
            src={Assets.cross_icon}
            alt="Close"
            className="absolute top-5 right-5 cursor-pointer w-5 h-5"
          />
        </form>
      </motion.div>
    </>
  );
}