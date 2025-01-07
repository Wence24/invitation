import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "react-modal";
import axios from "axios";

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [selectedImageLabel, setSelectedImageLabel] = useState("");
  const [kuromiTrail, setKuromiTrail] = useState([]);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showDateRequestPopup, setShowDateRequestPopup] = useState(false);
  const [noButtonOffset, setNoButtonOffset] = useState(0);

  const kuromiImagesForTrail = [
    { src: "/kuromi1.png", label: "Kuromi Trail 1" },
    { src: "/kuromi2.png", label: "Kuromi Trail 2" },
    { src: "/kuromi3.png", label: "Kuromi Trail 3" },
    { src: "/kuromi4.png", label: "Kuromi Trail 4" },
    { src: "/kuromi5.png", label: "Kuromi Trail 5" },
  ];

  const kuromiImagesForModal = [
    { src: "/pepper.jpg", label: "Pepper Lunch", description: "Classic Lunch Date" },
    { src: "/iscreamery.jpg", label: "Iscreamery", description: "Dessert Date (Optional)" },
    { src: "/coloseo.jpg", label: "Coloseo", description: "Classy Dinner Date" },
  ];

  useEffect(() => {
    const handleMouseMove = (event) => {
      setKuromiTrail((prevTrail) => [
        ...prevTrail,
        {
          id: Math.random(),
          x: event.clientX + Math.random() * 5 - 2.5,
          y: event.clientY + Math.random() * 5 - 2.5,
          image: kuromiImagesForTrail[Math.floor(Math.random() * kuromiImagesForTrail.length)].src,
        },
      ]);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const renderKuromiTrail = () =>
    kuromiTrail.map(({ id, x, y, image }) => (
      <motion.img
        key={id}
        src={image}
        alt="Kuromi"
        className="absolute"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0, 1.2, 0],
          x: [0, Math.random() * 10 - 5],
          y: [0, Math.random() * 10 - 5],
        }}
        transition={{ duration: 2 }}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: "50px",
          height: "50px",
        }}
      />
    ));

  const handleButtonClick = () => {
    setShowDateRequestPopup(true);
  };

  const handleNoButtonClick = () => {
    setNoButtonOffset(prev => prev === 0 ? 50 : 0);
  };

  const handleDateRequestResponse = (response) => {
    if (response === "yes") {
      setShowDateRequestPopup(false);
      setShowFlash(true);
      setShowCalendar(true);  // Set this immediately
      setShowBackground(true);  // Set this immediately
      setTimeout(() => {
        setShowFlash(false);
      }, 500);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const payload = {
      date: formattedDate,
      time,
      message,
      selectedImageLabel,
    };

    try {
      await axios.post("/api/notify", payload);
      alert("Email sent successfully!");
      setShowModal(false);
      setShowCalendar(false);
      setSelectedDate(null);
      setSelectedImageLabel("");
      setMessage("");
      setShowConfirmationPopup(true);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedDate(null);
    setShowCalendar(true);
    setSelectedImageLabel("");
    setMessage("");
  };

  const displayDateTime = () => {
    if (!selectedDate || !time) return "Please select a date and time.";
    
    const formattedDate = selectedDate.toLocaleDateString();
    const [hours, minutes] = time.split(":");
    let formattedTime = `${parseInt(hours) % 12 || 12}:${minutes}`;
    formattedTime += parseInt(hours) >= 12 ? " PM" : " AM";
    
    return `${formattedDate} at ${formattedTime}`;
  };

  const handleImageClick = (label) => {
    setSelectedImageLabel(label);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen">
      <AnimatePresence>
        {showBackground && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-0 w-full h-full"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute w-full h-full object-cover"
            >
              <source src="/bg.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </motion.div>
        )}
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-white z-20"
          />
        )}
      </AnimatePresence>

      {renderKuromiTrail()}

      {!showCalendar && !showConfirmationPopup && !showDateRequestPopup && (
        <motion.button
          onClick={handleButtonClick}
          className="px-8 py-4 text-white bg-purple-500 rounded-lg hover:bg-purple-700 z-30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Click Me
        </motion.button>
      )}

      {showDateRequestPopup && (
        <Modal
          isOpen={showDateRequestPopup}
          onRequestClose={() => setShowDateRequestPopup(false)}
          className="w-[400px] p-8 bg-white rounded-lg shadow-lg border-4 border-purple-500 glow-box"
          overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
        >
          <h2 className="text-center text-2xl font-bold mb-6">
            May I ask you out for a date?
          </h2>
          <div className="flex justify-between">
            <motion.button
              onClick={handleNoButtonClick}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg"
              animate={{ x: noButtonOffset }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              No
            </motion.button>
            <button
              onClick={() => handleDateRequestResponse("yes")}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-700"
            >
              Yes
            </button>
          </div>
        </Modal>
      )}

      {showCalendar && !selectedDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-10 z-10"
        >
          <h1 className="text-4xl font-bold text-center mb-6 text-white uppercase tracking-wider" style={{
            textShadow: `
              0 0 10px #a855f7,
              0 0 20px #a855f7,
              0 0 30px #a855f7,
              0 0 40px #a855f7
            `
          }}>
            PICK A DATE
          </h1>
          <Calendar
            onChange={handleDateChange}
            className="w-full max-w-7xl p-14 text-xl bg-white rounded-lg shadow-lg calendar-glow"
          />
        </motion.div>
      )}

      {selectedDate && (
        <p className="mt-6 text-xl text-center">
          Selected Date: {selectedDate.toDateString()}
        </p>
      )}

      <Modal
        isOpen={showModal}
        onRequestClose={handleCancel}
        className="w-[600px] p-8 bg-white rounded-lg shadow-lg border-4 border-purple-500 glow-box"
        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-center text-2xl font-bold mb-6">
          Set Time for {selectedDate?.toLocaleDateString()}
        </h2>

        <div className="mb-6">
          <label className="block text-lg font-medium">Time:<i>Click the circle on the right side</i></label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border rounded p-3 w-full text-lg"
          />
        </div>

        <div className="flex space-x-8 mt-6 justify-center">
          {kuromiImagesForModal.map((image, index) => (
            <div key={index} className="text-center">
              <motion.img
                src={image.src}
                alt={image.label}
                className="cursor-pointer w-36 h-36 mb-3 rounded-lg shadow-xl transform hover:scale-105 transition duration-300 ease-in-out glow-img"
                onClick={() => handleImageClick(image.label)}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <p className="text-lg font-bold">{image.label}</p>
              <p className="text-sm text-gray-500">{image.description}</p>
            </div>
          ))}
        </div>

        {selectedImageLabel && (
          <div className="mt-6 text-center">
            <h3 className="text-xl font-bold">Selected location:</h3>
            <p className="text-lg font-bold text-gray-700">{selectedImageLabel}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold">Confirm your date and time:</h3>
          <p className="text-lg text-gray-700">{displayDateTime()}</p>
        </div>

        <div className="mt-6">
          <label className="block text-lg font-medium">Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 mt-2 border rounded-lg"
            rows="4"
            placeholder="Type your message here..."
          ></textarea>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-400 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-700"
          >
            Confirm
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmationPopup}
        onRequestClose={() => setShowConfirmationPopup(false)}
        className="w-[400px] p-8 bg-white rounded-lg shadow-lg border-4 border-purple-500 glow-box"
        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-center text-2xl font-bold">Success!</h2>
        <p className="mt-4 text-center text-lg text-gray-700">
        Hey, I just want to thank you for giving me the chance again to prove myself. I didn't expect na I'll fall this deeply sayo, and I'm not ashamed to express it to you.  I genuinely admire everything about you. I'm more than willing to wait and pursue you the right way, no matter how long it takes, because I believe you're worth the risk.
        I hope I get to know you more. 
        Thank you so much for making time; I truly appreciate your effort and can't wait to spend time with you!
        </p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowConfirmationPopup(false)}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}