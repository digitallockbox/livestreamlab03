import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Cpu, Lock, Loader2, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import session from "@/lib/session";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const xClientId = import.meta.env.VITE_X_CLIENT_ID;
const youtubeClientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID || googleClientId;
const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/auth/login` : "";

function oauthUrl(provider) {
  const base = encodeURIComponent(redirectUri);
  const state = encodeURIComponent(`provider=${provider}`);
  switch (provider) {
    case "google":
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${base}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent&state=${state}`;
    case "x":
      return `https://twitter.com/i/oauth2/authorize?client_id=${xClientId}&redirect_uri=${base}&response_type=code&scope=users.read%20tweet.read&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
    case "youtube":
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${youtubeClientId}&redirect_uri=${base}&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly%20email%20profile&access_type=offline&prompt=consent&state=${state}`;
    default:
      return "#";
  }
}

export default function TridentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [twitchLoading, setTwitchLoading] = useState(false);
  const navigate = useNavigate();

  const handleTwitchLogin = useCallback(async () => {
    setTwitchLoading(true);
    try {
      const { client_id, redirect_uri } = await api.auth.twitchClientData();
      const twitchAuthUrl =
        `https://id.twitch.tv/oauth2/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=user:read:email&force_verify=true`;
      window.location.href = twitchAuthUrl;
    } catch (err) {
      toast.error("Failed to start Twitch login. Please try again.");
    } finally {
      setTwitchLoading(false);
    }
  }, []);

  // Handle OAuth callback (code in URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const stateParam = params.get("state") || "";

    if (!code) return;

    const provider = new URLSearchParams(decodeURIComponent(stateParam)).get("provider") || "google";

    (async () => {
      setOauthLoading(true);
      try {
        const oauthFn = api.auth.oauth[provider];
        if (!oauthFn) throw new Error(`Unknown OAuth provider: ${provider}`);
        const result = await oauthFn(code, redirectUri);
        await session.create(result.user || result, result.token || result.session_token);

        try {
          const status = await api.onboarding.status();
          if (status?.step && status.step !== "complete") {
            navigate("/onboarding", { replace: true });
            return;
          }
        } catch { /* proceed to dashboard */ }

        const role = result.user?.role || result.role || "creator";
        const routes = { creator: "/creator/dashboard", operator: "/creator/dashboard", founder: "/creator/dashboard", admin: "/creator/dashboard" };
        toast.success("Signed in!");
        navigate(routes[role] || "/creator/dashboard", { replace: true });
      } catch (err) {
        toast.error(err.message || "OAuth login failed");
        navigate("/auth/login", { replace: true });
      } finally {
        setOauthLoading(false);
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.login({ email, password });
      await session.create(result.user || result, result.token || result.session_token);

      try {
        const status = await api.onboarding.status();
        if (status?.step && status.step !== "complete") {
          navigate("/onboarding", { replace: true });
          return;
        }
      } catch { /* proceed to dashboard if status check fails */ }

      const role = result.user?.role || result.role || "creator";
      const routes = {
        creator: "/creator/dashboard",
        operator: "/creator/dashboard",
        admin: "/creator/dashboard",
        founder: "/creator/dashboard",
        user: "/creator/dashboard",
      };

      toast.success("Welcome back!");
      navigate(routes[role] || "/creator/dashboard");
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
        <div className="text-center lg:text-left">
          <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
            <Badge className="bg-accent/10 text-accent border-accent/20 gap-1 text-xs font-mono">
              <Cpu className="w-3 h-3" /> Trident OS
            </Badge>
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to your creator console.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-sm">Email Address</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5 bg-secondary border-border h-11" required autoFocus />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-sm">Password</Label>
              <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-secondary border-border h-11 pr-11" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-3">or continue with</div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5">
          <a href={oauthUrl("google")} className="block">
            <Button className="w-full h-10 bg-white hover:bg-gray-50 text-gray-700 text-xs gap-2 font-semibold border border-gray-300" type="button">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>
          </a>
          <Button onClick={handleTwitchLogin} disabled={twitchLoading} className="w-full h-10 bg-[#9146FF] hover:bg-[#7c34e6] text-white text-xs gap-2 font-semibold" type="button">
            {twitchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0H6zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714v9.429z"/></svg>
            )}
            Continue with Twitch
          </Button>
          <a href={oauthUrl("x")} className="block">
            <Button className="w-full h-10 bg-black hover:bg-gray-900 text-white text-xs gap-2 font-semibold border border-gray-800" type="button">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Continue with X
            </Button>
          </a>
          <a href={oauthUrl("youtube")} className="block">
            <Button className="w-full h-10 bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs gap-2 font-semibold" type="button">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              Continue with YouTube
            </Button>
          </a>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
            Create one <UserPlus className="w-3 h-3" />
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Secured by Trident OS · AES-256</span>
        </div>
      </motion.div>
    </div>
  );
}