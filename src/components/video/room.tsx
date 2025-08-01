import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const JoinCall = () => {
  const { roomName } = useParams();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domain = 'meet.jit.si';
    const options = {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        prejoinPageEnabled: true,
      },
      userInfo: {
        displayName: 'Client',
      },
    };

    const api = new (window as any).JitsiMeetExternalAPI(domain, options);
    return () => api.dispose();
  }, [roomName]);

  return <div ref={jitsiContainerRef} className="h-screen w-full" />;
};

export default JoinCall;
