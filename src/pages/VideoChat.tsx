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

  const startMeeting = async () => {
    setIsGenerating(true);
    
    try {
      // Wait a moment to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const domain = 'meet.jit.si';
      const roomName = `TheraLink-${therapistId}-${Date.now()}`;
      const generatedLink = `https://${domain}/${roomName}`;

      const options = {
        roomName,
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

      // Check if Jitsi is available
      if (!(window as any).JitsiMeetExternalAPI) {
        throw new Error('Jitsi Meet API is not available. Please refresh the page.');
      }

      const api = new (window as any).JitsiMeetExternalAPI(domain, options);
      
      // Set up event listeners
      api.addEventListener('videoConferenceJoined', () => {
        console.log('Therapist joined the meeting');
        toast.success('You have joined the video session');
      });

      api.addEventListener('participantJoined', (participant: any) => {
        console.log('Participant joined:', participant);
        toast.success('A participant joined the session');
      });

      api.addEventListener('videoConferenceLeft', () => {
        console.log('Video conference left');
        setMeetingStarted(false);
        setJitsiApi(null);
      });

      setJitsiApi(api);
      setMeetingStarted(true);
      setMeetingLink(generatedLink);
      toast.success('Meeting session started successfully!');
      
    } catch (error) {
      console.error('Error starting meeting:', error);
      toast.error('Failed to start meeting. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      toast.success('Meeting link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link. Please copy manually.');
    }
  };

  const endMeeting = () => {
    if (jitsiApi) {
      jitsiApi.dispose();
      setJitsiApi(null);
    }
    setMeetingStarted(false);
    setMeetingLink('');
    toast.success('Meeting ended successfully');
  };

  const goBack = () => {
    if (jitsiApi) {
      jitsiApi.dispose();
    }
    navigate(-1);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [jitsiApi]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10">
      {!meetingStarted ? (
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant="secondary">
              <Video className="h-3 w-3 mr-1" />
              Video Session
            </Badge>
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto">
            <Card className="card-shadow">
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
                {/* Session Info */}
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

                {/* Start Button */}
                <Button 
                  onClick={startMeeting} 
                  disabled={isGenerating}
                  className="w-full button-gradient h-12 text-lg"
                >
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

                {/* Meeting Link Section */}
                {meetingLink && (
                  <div className="space-y-4 p-6 bg-accent/10 rounded-lg border-2 border-dashed border-primary/20">
                    <div className="flex items-center gap-2">
                      <Share className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Meeting Link Ready!</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Share this link with your client to join the video session:
                    </p>
                    
                    <div className="flex gap-2">
                      <Input 
                        value={meetingLink} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button onClick={copyToClipboard} variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(meetingLink, '_blank')}
                        variant="outline"
                        className="flex-1"
                      >
                        Open in New Tab
                      </Button>
                      <Button
                        onClick={() => {
                          const subject = 'TheraLink Video Session';
                          const body = `Hi,\n\nPlease join our video therapy session using this link:\n\n${meetingLink}\n\nBest regards`;
                          window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Send via Email
                      </Button>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="text-center text-sm text-muted-foreground space-y-2">
                  <p>💡 <strong>Tip:</strong> Test your camera and microphone before the session</p>
                  <p>🔒 All sessions are secure and encrypted</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="h-screen w-full relative">
          {/* Meeting Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button
              onClick={endMeeting}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              End Meeting
            </Button>
            <Button
              onClick={goBack}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Exit
            </Button>
          </div>
          
          {/* Jitsi Container */}
          <div ref={jitsiContainerRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;
