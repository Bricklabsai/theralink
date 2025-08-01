import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const VideoCallPage = () => {
  const { therapistId } = useParams();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  const startMeeting = () => {
    const domain = 'meet.jit.si';
    const roomName = `TherapySession-${therapistId}-${Date.now()}`;

    const options = {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
      },
      configOverwrite: {
        prejoinPageEnabled: false,
      },
      userInfo: {
        displayName: 'Therapist',
      },
    };

    const api = new (window as any).JitsiMeetExternalAPI(domain, options);
    setMeetingStarted(true);
    setMeetingLink(`https://${domain}/${roomName}`);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      {!meetingStarted ? (
        <>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
            onClick={startMeeting}
          >
            Start Session & Generate Link
          </button>

          {meetingLink && (
            <div className="mt-4">
              <p className="text-sm text-gray-700">Share this link with your client:</p>
              <a
                href={meetingLink}
                className="text-blue-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {meetingLink}
              </a>
            </div>
          )}
        </>
      ) : (
        <div ref={jitsiContainerRef} className="h-full w-full" />
      )}
    </div>
  );
};

export default VideoCallPage;
