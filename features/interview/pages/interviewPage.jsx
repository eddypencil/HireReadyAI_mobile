import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useInterviewQuestions from "../hooks/useInterviewQuestions";
import { updateInterview } from "../services/interview_database_service";
import { uploadRecording, retryPendingTranscriptions } from "../services/video_storage_service";
import { supabase } from "@/shared/services/supabase";
import { INTERVIEW_STATUS } from "@/shared/constants/enums";

export default function InterviewPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { interview ,questions, loading, error } = useInterviewQuestions(applicationId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const blobRef = useRef(null);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionGranted(true);
    } catch (err) {
      alert(
        "Camera and Microphone permissions are required to start the interview simulation.",
      );
      console.error("Permission error:", err);
    }
  };

  const startRecording = () => {
    setVideoUrl(null);
    chunksRef.current = [];

    const options = { mimeType: "video/webm; codecs=vp9" };
    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, options);
    } catch (e) {
      recorder = new MediaRecorder(streamRef.current);
    }

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setTimeLeft(180);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">questions are being loaded</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">{error}</div>;
  }

  if (!questions.length)
    return (
      <div className="min-h-screen flex items-center justify-center">
        No questions found for this interview.
      </div>
    );

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-5 shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
            ✓
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-gray-800 tracking-tight">
              Interview Completed!
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Your responses have been successfully captured and recorded.
            </p>
          </div>
          <div className="pt-2 text-xs text-slate-400 animate-pulse">
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-4xl space-y-6">
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center shadow-lg transition-all duration-300">
          <div>
            <h2 className="font-bold text-lg tracking-tight">
              AI Automated Interview Session
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Testing Environment · Video & Sound Check
            </p>
          </div>
          {isRecording && (
            <div className="bg-red-600 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold animate-pulse flex items-center gap-2 shadow-sm border border-red-500">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              Recording | {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {!permissionGranted ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-5 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              📹
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-gray-800 tracking-tight">
                Hardware Verification Required
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                This platform requires temporary access to your camera and
                microphone to simulation-test the AI video response feature.
              </p>
            </div>
            <button
              onClick={requestPermissions}
              className="bg-violet-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-violet-700 active:scale-95 transition-all shadow-md text-sm"
            >
              Enable Camera & Microphone
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-4 flex flex-col justify-between bg-white border border-gray-200 rounded-2xl p-6 shadow-xs min-h-[360px]">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-2.5 py-1 rounded-md">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 leading-relaxed tracking-tight pt-2">
                  {questions[currentQuestionIndex]?.text}
                </h3>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3">
                {!isRecording && !videoUrl && (
                  <button
                    onClick={startRecording}
                    className="w-full bg-red-600 text-white py-3.5 rounded-xl font-semibold hover:bg-red-700 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="text-base">🔴</span> Start Recording Answer
                    (Max 3 Mins)
                  </button>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-900 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="text-base">⏹️</span> Stop & Review Answer
                  </button>
                )}

                {videoUrl && (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <span>✓</span> Answer captured successfully! Review it on
                      the player.
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={startRecording}
                        className="flex-1 border border-red-200 text-red-600 bg-red-50/40 py-3 rounded-xl text-xs font-semibold hover:bg-red-50 active:scale-[0.98] transition-all"
                      >
                        🔄 Retake / Re-record
                      </button>

                      <button
                        onClick={async() => {
                          const question = questions[currentQuestionIndex];

                          if (blobRef.current && interview?.id) {
                            try {
                              const { fileName } = await uploadRecording(
                                blobRef.current,
                                interview.id,
                                question.id,
                              );

                              supabase.functions.invoke("whisper-api", {
                                body: { audioPath: fileName, questionId: question.id },
                              }).catch((err) => {
                                console.error("Background transcription failed:", err);
                              });
                            } catch (err) {
                              console.error("Upload failed:", err);
                            }
                            blobRef.current = null;
                          }

                          if (currentQuestionIndex < questions.length - 1) {
                            setCurrentQuestionIndex((prev) => prev + 1);
                            setVideoUrl(null);
                          } else {
                            if (streamRef.current) {
                              streamRef.current.getTracks().forEach((track) => track.stop());
                            }
                            if (applicationId) {
                              localStorage.setItem(`interview_completed_${applicationId}`, "true");
                            }

                            retryPendingTranscriptions(interview.id).catch((err) => {
                              console.error("Retry transcriptions failed:", err);
                            });

                            setIsFinished(true);
                            await updateInterview(interview.id,{status:INTERVIEW_STATUS.completed})
                            setTimeout(() => {
                              navigate("/applicant");
                            }, 2500);
                          }
                        }}
                        className="flex-1 bg-violet-600 text-white py-3 rounded-xl text-xs font-semibold hover:bg-violet-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        Next Question ➔
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center relative border border-slate-800 min-h-[260px]">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}