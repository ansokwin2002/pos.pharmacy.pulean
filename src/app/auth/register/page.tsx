'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Flex, Heading, Text, Button, Link, Card, IconButton, TextField } from '@radix-ui/themes';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import { register as apiRegister, saveAuth } from '@/utilities/api/auth';
import { toast } from 'sonner';

export default function RegisterPage() {
  usePageTitle('Register');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await apiRegister({
        name: fullName,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      saveAuth(res.access_token);
      toast.success('Registration successful');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Register failed:', error);
      const detail = error?.detail;
      const message = detail?.message || Object.values(detail?.errors || {})?.[0]?.[0] || 'Registration failed';
      setError(String(message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex className="h-screen">
      {/* Left side image same as login */}
      <div className="hidden md:block w-1/2 relative">
        <Image
          src="/images/restaurant-counter.png"
          alt="Restaurant counter"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="p-8 text-white text-center">
            <Heading size="8" className="mb-4 text-white">EatlyPOS</Heading>
            <Text size="5" className="text-white/90">Managing your restaurant made easy</Text>
          </div>
        </div>
      </div>

      {/* Right side - Register form */}
      <Flex 
        direction="column"
        justify="end"
        className="w-full md:w-1/2 px-4 sm:px-6 lg:px-8 py-12"
      >
        <Box className="flex-grow"></Box>
        
        <Box className="text-center" mb="6">
          <Flex direction="column" align="center" gap="4">
            {(() => {
              const [mounted, setMounted] = useState(false);
              useEffect(() => setMounted(true), []);
              return mounted ? (
                <Image
                  src={theme === 'dark' ? '/images/logo-dark.png' : '/images/logo.png'}
                  alt="EatlyPOS Logo"
                  width={130}
                  height={20}
                  priority
                />
              ) : (
                <div style={{ width: 130, height: 20 }} />
              );
            })()}
            <Heading size="5">Create your account</Heading>
          </Flex>
        </Box>

        <Container size="2" className="max-w-md w-full mx-auto">
          <Card size="3">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Text size="2" color="red">{error}</Text>
              )}

              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">Full Name</Text>
                <TextField.Root 
                  type="text"
                  placeholder="John Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full"
                >
                  <TextField.Slot>
                    <User size={16} />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">Email Address</Text>
                <TextField.Root 
                  type="email"
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                >
                  <TextField.Slot>
                    <Mail size={16} />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">Password</Text>
                <TextField.Root
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                >
                  <TextField.Slot>
                    <Lock size={16} />
                  </TextField.Slot>
                  <TextField.Slot>
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="gray"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-0 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">Confirm Password</Text>
                <TextField.Root
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                >
                  <TextField.Slot>
                    <Lock size={16} />
                  </TextField.Slot>
                  <TextField.Slot>
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="gray"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-0 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              <Box>
                <Button 
                  type="submit"
                  className="!w-full"
                  disabled={isLoading}
                  size="3"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </Box>
            </form>
          </Card>
          <Box className="text-center mt-4">
            <Text size="2">Already have an account? </Text>
            <Link href="/auth/login" size="2">Sign in</Link>
          </Box>
        </Container>

        <Box className="text-center mt-8 mb-4">
          <Text as="p" size="1" color="gray">
            © {new Date().getFullYear()} EatlyPOS. All rights reserved.
          </Text>
          <Text as="p" size="1" color="gray">
            Version 1.0.0 (Build 001)
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}
