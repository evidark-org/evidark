import { signInAction, signInGithub } from "@/lib/actions";
import { Github, LogIn, Skull, Ghost, Eye, Mail, Lock } from "lucide-react";
import { Creepster, Inter } from "next/font/google";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/app/_components/auth/LoginForm";
import RegisterForm from "@/app/_components/auth/RegisterForm";

const creepster = Creepster({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const page = () => {
  return (
    <div className="min-h-screen horror-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <Skull className="w-8 h-8 text-primary animate-pulse" />
              <CardTitle className={`${creepster.className} text-3xl text-foreground shadow-text`}>
                EviDark
              </CardTitle>
              <Ghost className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className={`${inter.className} text-muted-foreground`}>
              Enter the realm of darkness
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <LoginForm />
                
                <div className="relative">
                  <Separator className="bg-border" />
                  <div className="absolute inset-0 flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">
                      or continue with
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <form action={signInAction}>
                    <Button 
                      type="submit"
                      variant="outline"
                      className="w-full border-border hover:bg-secondary"
                      size="sm"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Google
                    </Button>
                  </form>

                  <form action={signInGithub}>
                    <Button 
                      type="submit"
                      variant="outline"
                      className="w-full border-border hover:bg-secondary"
                      size="sm"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <RegisterForm />
              </TabsContent>
            </Tabs>

            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>Read Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ghost className="w-4 h-4 text-primary" />
                  <span>Share Tales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-primary" />
                  <span>Connect</span>
                </div>
              </div>

              <p className={`${inter.className} text-xs text-muted-foreground leading-relaxed`}>
                By continuing, you agree to EviDark's{" "}
                <span className="text-primary hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and acknowledge our{" "}
                <span className="text-primary hover:underline cursor-pointer">
                  Privacy Policy
                </span>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className={`${inter.className} text-sm text-muted-foreground`}>
            New to dark storytelling?{" "}
            <span className="text-primary hover:underline cursor-pointer">
              Explore without signing in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
