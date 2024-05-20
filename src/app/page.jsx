"use client";
import React, { useEffect, useState, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

import { FaPlay, FaPause } from "react-icons/fa";
import { FiScissors } from "react-icons/fi";

const Page = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [regions, setRegions] = useState([]);
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
        RegionsPlugin.create({}),
      ],
    });

    wavesurfer.current.on("ready", () => {
      setDuration(wavesurfer.current.getDuration());
    });

    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });

    wavesurfer.current.on("region-click", (region, e) => {
      e.stopPropagation();
      wavesurfer.current.play(region.start, region.end);
    });

    wavesurfer.current.on("region-created", (region) => {
      setRegions((prevRegions) => [...prevRegions, region]);
      setStartTime(region.start);
      setEndTime(region.end);
    });

    wavesurfer.current.on("region-removed", (region) => {
      setRegions((prevRegions) => prevRegions.filter((r) => r !== region));
      setStartTime(0);
      setEndTime(0);
    });

    return () => wavesurfer.current.destroy();
  }, []);

  const handleTrim = (e) => {
    if (wavesurferObj) {
      // get start and end points of the selected region
      const region =
        wavesurferObj.regions.list[Object.keys(wavesurferObj.regions.list)[0]];

      if (region) {
        const start = region.start;
        const end = region.end;

        // obtain the original array of the audio
        const original_buffer = wavesurferObj.backend.buffer;

        // create a temporary new buffer array with the same length, sample rate and no of channels as the original audio
        const new_buffer = wavesurferObj.backend.ac.createBuffer(
          original_buffer.numberOfChannels,
          original_buffer.length,
          original_buffer.sampleRate
        );

        // create 2 indices:
        // left & right to the part to be trimmed
        const first_list_index = start * original_buffer.sampleRate;
        const second_list_index = end * original_buffer.sampleRate;
        const second_list_mem_alloc =
          original_buffer.length - end * original_buffer.sampleRate;

        // create a new array upto the region to be trimmed
        const new_list = new Float32Array(parseInt(first_list_index));

        // create a new array of region after the trimmed region
        const second_list = new Float32Array(parseInt(second_list_mem_alloc));

        // create an array to combine the 2 parts
        const combined = new Float32Array(original_buffer.length);

        // 2 channels: 1-right, 0-left
        // copy the buffer values for the 2 regions from the original buffer

        // for the region to the left of the trimmed section
        original_buffer.copyFromChannel(new_list, 1);
        original_buffer.copyFromChannel(new_list, 0);

        // for the region to the right of the trimmed section
        original_buffer.copyFromChannel(second_list, 1, second_list_index);
        original_buffer.copyFromChannel(second_list, 0, second_list_index);

        // create the combined buffer for the trimmed audio
        combined.set(new_list);
        combined.set(second_list, first_list_index);

        // copy the combined array to the new_buffer
        new_buffer.copyToChannel(combined, 1);
        new_buffer.copyToChannel(combined, 0);

        // load the new_buffer, to restart the wavesurfer's waveform display
        wavesurferObj.loadDecodedBuffer(new_buffer);
      }
    }
  };

  const adRegion = () => {
    const startTime = 5; // replace with your desired start time
    const endTime = 10; // replace with your desired end time

    wavesurfer.current.addRegion({
      start: startTime,
      end: endTime,
      color: "rgba(0, 102, 255, 0.1)",
    });
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      wavesurfer.current.load(URL.createObjectURL(file));
    }
  };

  const playRegion = () => {
    if (regions.length > 0) {
      wavesurfer.current.play(regions[0].start, regions[0].end);
    }
  };

  const removeAllRegions = () => {
    wavesurfer.current.clearRegions();
    setRegions([]);
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
          <button className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            <FiScissors />
          </button>
          <div style={{ display: "flex" }}>
            <button
              className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={adRegion}
            >
              Play Region
            </button>
            <button
              className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={removeAllRegions}
            >
              Remove Region
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
