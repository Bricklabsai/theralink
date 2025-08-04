import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeftCircle,
  Calendar,
  FileText,
  Image,
  Lock,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react";



const formatMessageDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return date.toLocaleString();
  }
};

const ChatPage = () => {
  const { therapistId } = useParams<{ therapistId: string }>();
  const [therapist, setTherapist] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch therapist info and messages
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: therapistData, error: therapistError } = await supabase
          .from("therapists")
          .select("*")
          .eq("id", therapistId)
          .single();

        if (therapistError) throw therapistError;
        setTherapist(therapistData);

        const { data: messageData, error: messageError } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user?.id},receiver_id.eq.${therapistId}),and(sender_id.eq.${therapistId},receiver_id.eq.${user?.id})`
          )
          .order("timestamp", { ascending: true });

        if (messageError) throw messageError;
        setMessages(messageData);
      } catch (error) {
        console.error("Error loading chat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [therapistId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const message = {
      sender_id: user?.id,
      receiver_id: therapistId,
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("messages")
      .insert([message])
      .select();

    if (error) {
      console.error("Failed to send message:", error.message);
      return;
    }

    setMessages((prev) => [...prev, ...data]);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <p>Loading conversation...</p>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="text-center py-10">
        <p className="text-lg font-semibold">Therapist Not Found</p>
        <Link to="/therapists" className="text-blue-500 underline">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto h-[85vh] flex flex-col">
        <Card className="flex flex-col flex-1 overflow-hidden">
          <CardHeader className="flex justify-between items-center bg-muted">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeftCircle className="h-5 w-5" />
                </Link>
              </Button>
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <MessageCircle />
              </div>
              <div>
                <h2 className="font-semibold">{therapist.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {therapist.status || "Status unknown"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/video/${therapistId}`}>
                  <Video className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/call/${therapistId}`}>
                  <Phone className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/therapists/${therapistId}/book`}>
                  <Calendar className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            <div className="flex justify-center">
              <span className="bg-accent px-4 py-1.5 rounded-full text-xs flex items-center">
                <Lock className="h-3 w-3 mr-2" /> End-to-end encrypted
              </span>
            </div>

            {messages.map((msg) => {
              const isSelf = msg.sender_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      isSelf
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-card rounded-tl-none"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div className="text-xs text-right mt-1 text-muted-foreground">
                      {formatMessageDate(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center w-full gap-3">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>

              <div className="relative flex-1">
                <Input
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pr-24 rounded-full"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Image className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Button
                size="icon"
                disabled={!inputMessage.trim()}
                onClick={sendMessage}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;
