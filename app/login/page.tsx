'use client';

import LoginPageComponent from '@/components/design/LoginPageComponent';
import Background from '@/components/design/Background';

export default function LoginPage() {
    return (
        <main className="relative min-h-screen bg-[#020202] overflow-hidden">
            <Background />
            <LoginPageComponent />
        </main>
    );
}
