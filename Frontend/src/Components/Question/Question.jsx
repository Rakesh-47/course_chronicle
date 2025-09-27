import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../Context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./Question.css";
import { useParams } from "react-router-dom";
import coinIcon from "../../Assets/coin.svg";
import searchIcon from "../../Assets/search.svg";

const QuestionList = () => {
  const auth = useContext(AuthContext);
  const { id } = useParams();
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [unlockedAnswers, setUnlockedAnswers] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (id) {
      // Fetch a single paper by ID
      fetch("http://localhost:8000/getPaperByID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ paperID: id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.paper) setSelectedPaper(data.paper);
        })
        .catch((error) => console.error("Error fetching paper:", error));
    } else {
      // Fetch all papers for the list view
      fetch("http://localhost:8000/getPapers", {
        headers: { Authorization: "Bearer " + auth.token },
      })
        .then((res) => res.json())
        .then((data) => setPapers(data))
        .catch((error) => console.error("Error fetching papers:", error));
    }
  }, [id, auth.token]);

  useEffect(() => {
    if (selectedPaper) {
      fetch("http://localhost:8000/getUnlockedAnswers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ paperId: selectedPaper._id }),
      })
        .then((res) => res.json())
        .then((data) => {
          const unlocked = {};
          if (data.unlockedAnswers) {
            data.unlockedAnswers.forEach((qIndex) => {
              unlocked[qIndex] = true;
            });
          }
          setUnlockedAnswers(unlocked);
        })
        .catch((error) => {
          console.error("Error fetching unlocked answers:", error);
          setUnlockedAnswers({});
        });
    }
  }, [selectedPaper, auth.token]);

  const handlePaperClick = (paper) => {
    setSelectedPaper(paper);

    // Update browsed courses for the user by calling the update endpoint
    fetch("http://localhost:8000/updateBrowsedCourse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ course: paper.course.code }),
    })
      .then((res) => res.json())
      .then((data) =>
        console.log("User browsed courses updated:", data)
      )
      .catch((error) =>
        console.error("Error updating browsed courses:", error)
      );
  };

  const handleClose = () => {
    setSelectedPaper(null);
  };

  const handleUnlock = async (index) => {
    if (auth.credit < 5) {
      alert("Not enough credits to unlock this answer.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to unlock this answer for 5 credits?");
    if (confirmed) {
      try {
        const response = await fetch("http://localhost:8000/unlockAnswer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          },
          body: JSON.stringify({
            paperId: selectedPaper._id,
            questionIndex: index,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to unlock answer.");
        }
        // Deduct 5 credits in the Auth context
        auth.updateCredit(auth.credit - 5);
        // Mark this answer as unlocked in local state
        setUnlockedAnswers((prev) => ({ ...prev, [index]: true }));
      } catch (error) {
        alert("Error unlocking answer: " + error.message);
      }
    }
  };

  const filteredPapers = papers.filter((paper) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const courseCode = paper.course?.code?.toLowerCase() || "";
    const courseName = paper.course?.name?.toLowerCase() || "";
    const tags = (paper.questions || [])
      .map((q) => q.tag?.toLowerCase() || "")
      .join(" ");
    return (
      courseCode.includes(query) ||
      courseName.includes(query) ||
      tags.includes(query)
    );
  });

  return (
    <div className="w-full p-6 mx-auto mt-16 bg-gray-900 text-white shadow-2xl border border-gray-700">
      {!selectedPaper ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Uploaded Papers</h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search by course code, name, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-2 rounded-3xl bg-gray-800 border border-gray-600 text-white pl-12"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <img src={searchIcon} alt="search" className="w-5 h-5" />
            </span>
          </div>
          <ul className="space-y-4">
            {filteredPapers.map((paper) => (
              <li
                key={paper._id}
                className="p-5 bg-gray-800 border border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer"
                onClick={() => handlePaperClick(paper)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg">
                      [{paper.course ? `${paper.course.code}] ${paper.course.name}` : "N/A"}
                    </span>
                    <span className="ml-2 text-lg">
                      ({paper.examType})
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(paper.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-400">
                    Session: {paper.session} {paper.sessionYear}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(paper.questions || []).map((q, idx) =>
                    q.tag ? (
                      <span
                        key={idx}
                        className="bg-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {q.tag}
                      </span>
                    ) : null
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex">
          {/* Left Side: Paper */}
          <div className="w-1/2 p-4 bg-gray-800 border-r border-gray-700">
            <h3 className="text-lg font-bold mb-4">{selectedPaper.title}</h3>
            {selectedPaper.filePath.endsWith('.pdf') ? (
              <iframe
                src={`http://localhost:8000${selectedPaper.filePath}`}
                title="Paper"
                className="w-full h-[80vh] border border-gray-600"
              ></iframe>
            ) : (
              <img
                src={`http://localhost:8000${selectedPaper.filePath}`}
                alt="Question Paper"
                className="w-full h-[80vh] object-contain border border-gray-600"
              />
            )}
          </div>

          {/* Right Side: Questions and Answers */}
          <div className="w-1/2 p-4 bg-gray-800 overflow-y-auto h-[90vh]">
            <h3 className="text-lg font-bold mb-4">Questions and Answers</h3>
            <ul className="space-y-4">
              {selectedPaper.questions.map((qa, index) => (
                <li
                  key={index}
                  className="p-4 bg-gray-700 border border-gray-600 rounded-lg shadow-md"
                >
                  <h4 className="font-bold">Q{index + 1}: {qa.question}</h4>
                  <hr className="mt-2 border-gray-600" />
                  <div className="mt-2 text-gray-100">
                    {unlockedAnswers[index] ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                        // Override block math rendering: wrap in a full-width, centered div with vertical margins
                          math: ({ node, ...props }) => (
                            <div className="w-full my-4 flex justify-center">
                              <span {...props} />
                            </div>
                          ),
                          inlineMath: ({ node, ...props }) => <span {...props} />,
                          h1: ({ node, ...props }) => (
                            <h1 {...props} className="mt-2 mb-2 text-2xl font-bold" />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 {...props} className="mt-2 mb-2 text-xl font-bold" />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 {...props} className="mt-2 mb-2 text-lg font-bold" />
                          ),
                          p: ({ node, ...props }) => (
                            <p {...props} className="text-gray-100" />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul {...props} className="list-disc ml-6 text-gray-100" />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol {...props} className="list-decimal ml-6 text-gray-100" />
                          ),
                          li: ({ node, ...props }) => (
                            <li {...props} className="text-gray-100" />
                          )
                        }}
                      >
                        {qa.answer}
                      </ReactMarkdown>
                    ) : (
                      <button
                        className="flex items-center mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => handleUnlock(index)}
                      >
                        Unlock Answer&nbsp;
                        <span className="flex items-center ml-2">
                          5
                          <img
                            src={coinIcon}
                            className="w-auto h-5 ml-1 inline-block text-white align-middle"
                          />
                        </span>
                      </button>
                    )}
                  </div>
                  {qa.tag && (
                    <p className="mt-1 text-sm text-gray-400">
                      Tag: {qa.tag}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {selectedPaper && (
        <button
          onClick={handleClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Papers
        </button>
      )}
    </div>
  );
};

export default QuestionList;
