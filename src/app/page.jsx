"use client";
import React, { useEffect, useState, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";

import { FaPlay, FaPause } from "react-icons/fa";

const Page = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  function formatTime(seconds) {
    let date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const waveformRef = useRef(null);
  const timelineRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "violet",
      responsive: true,
      backend: "WebAudio",
      progressColor: "purple",
      plugins: [
        TimelinePlugin.create({
          container: timelineRef.current,
        }),
      ],
    });

    wavesurfer.current.on("ready", () => {
      setDuration(wavesurfer.current.getDuration());
    });

    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });

    return () => wavesurfer.current.destroy();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      wavesurfer.current.load(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex px-96 justify-start items-center h-screen text-center">
      <input
        type="file"
        accept="audio/*"
        required
        id="audio-file-input"
        className="m-2"
        onChange={handleFileChange}
      />
      <div className="flex pl-48 justify-center items-center h-screen flex-col">
        <div id="waveform" ref={waveformRef} className="w-full h-64 m-2"></div>
        <div id="timeline" ref={timelineRef} className="w-full h-20 m-2"></div>
        <div>
          <span>
            Duration: {formatTime(duration)} | Current Time:{" "}
            {formatTime(currentTime)}
          </span>

          <button
            className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              if (isPlaying) {
                wavesurfer.current.pause();
              } else {
                wavesurfer.current.play();
              }
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
