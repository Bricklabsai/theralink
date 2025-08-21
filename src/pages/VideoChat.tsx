import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Video, ArrowLeft, Users, Clock, Share } from 'lucide-react';
import { toast } from 'sonner';

const VideoCallPage = () => {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  const [meetingStarted, setMeetingStarted] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [jitsiApi, setJitsiApi] = useState<any>(null);

  const [pendingRoomName, setPendingRoomName] = useState<string | null>(null);

  const startMeeting = async () => {
    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // show loading briefly
      const domain = 'meet.jit.si';
      const roomName = `TheraLink-${therapistId || 'Guest'}-${Date.now()}`;
      const generatedLink = `https://${domain}`;

      setMeetingLink(generatedLink);
      setPendingRoomName(roomName);
      setMeetingStarted(true); // render the container before initializing Jitsi
    setMeetingStarted(true);
    } catch (error) {
      console.error('Error starting meeting:', error);
      toast.error('Failed to start meeting. Please try again.');
      setIsGenerating(false);
    }
  };

  // Initialize Jitsi only after container exists
  useEffect(() => {
    if (!pendingRoomName || !jitsiContainerRef.current) return;

    try {
      const domain = 'meet.jit.si';
      const options = {
        roomName: pendingRoomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'chat', 'desktop',
            'participants-pane', 'raise-hand', 'fullscreen',
            'security', 'hangup'
          ],
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          enableClosePage: false,
          disableThirdPartyRequests: true,
        },
        userInfo: {
          displayName: 'Therapist',
        },
      };

      if (!(window as any).JitsiMeetExternalAPI) {
        throw new Error('Jitsi Meet API not available.');
      }

      const api = new (window as any).JitsiMeetExternalAPI(domain, options);

      api.addEventListener('videoConferenceJoined', () => {
        toast.success('You have joined the video session');
      });

      api.addEventListener('participantJoined', (participant: any) => {
        toast.success(`${participant.displayName || 'A participant'} joined`);
      });

      api.addEventListener('videoConferenceLeft', () => {
        setMeetingStarted(false);
        setJitsiApi(null);
      });

      setJitsiApi(api);
    } catch (error) {
      console.error('Error initializing Jitsi:', error);
      toast.error('Failed to load meeting.');
      setMeetingStarted(false);
    } finally {
      setIsGenerating(false);
    }
  }, [pendingRoomName]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      toast.success('Meeting link copied!');
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const endMeeting = () => {
    if (jitsiApi) jitsiApi.dispose();
    setMeetingStarted(false);
    setMeetingLink('');
    setPendingRoomName(null);
    setJitsiApi(null);
    toast.success('Meeting ended.');
  };

  const goBack = () => {
    if (jitsiApi) jitsiApi.dispose();
    navigate(-1);
  };

  useEffect(() => {
    return () => {
      if (jitsiApi) jitsiApi.dispose();
    };
  }, [jitsiApi]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10">
      {!meetingStarted ? (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Badge variant="secondary">
              <Video className="h-3 w-3 mr-1" /> Video Session
            </Badge>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Video className="h-6 w-6 text-primary" />
                  Start Video Session
                </CardTitle>
                <CardDescription>
                  Generate a secure meeting link to share with your client
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/20">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Session Type</p>
                      <p className="text-xs text-muted-foreground">Private 1-on-1</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/20">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-xs text-muted-foreground">Unlimited</p>
                    </div>
                  </div>
                </div>

                <Button onClick={startMeeting} disabled={isGenerating} className="w-full h-12 text-lg">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                      Generating Session...
                    </>
                  ) : (
                    <>
                      <Video className="h-5 w-5 mr-3" />
                      Start Session & Generate Link
                    </>
                  )}
                </Button>

                {meetingLink && (
                  <div className="space-y-4 p-6 bg-accent/10 rounded-lg border-2 border-dashed border-primary/20">
                    <div className="flex items-center gap-2">
                      <Share className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Meeting Link Ready!</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Share this link with your client:
                    </p>
                    <div className="flex gap-2">
                      <Input value={meetingLink} readOnly className="font-mono text-sm" />
                      <Button onClick={copyToClipboard} variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="h-screen w-full relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button onClick={endMeeting} variant="destructive" size="sm">
              End Meeting
            </Button>
            <Button onClick={goBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Exit
            </Button>
          </div>
          <div ref={jitsiContainerRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;
