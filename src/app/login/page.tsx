"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shirt, Mail, Lock, UserPlus, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

export default function LoginPage() {
    const { user, loginWithEmail, registerWithEmail } = useAuth();
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setLoading(false);
            return;
        }

        try {
            if (isRegistering) {
                await registerWithEmail(email, password, name);
                Swal.fire({
                    icon: 'success',
                    title: 'Cuenta creada',
                    text: 'Bienvenido a Wingx',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await loginWithEmail(email, password);
                // Swal is not needed for login success as we redirect, but we can do a toast if we want.
            }
        } catch (err: any) {
            console.error(err);
            let msg = "Ocurrió un error al procesar tu solicitud.";
            if (err.code === 'auth/email-already-in-use') msg = "El correo ya está registrado.";
            if (err.code === 'auth/invalid-credential') msg = "Credenciales incorrectas.";
            if (err.code === 'auth/user-not-found') msg = "Usuario no encontrado.";
            if (err.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
            if (err.code === 'auth/weak-password') msg = "La contraseña es muy débil.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-800 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600/20 p-4 rounded-2xl">
                            <Shirt className="text-blue-500 w-16 h-16" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isRegistering ? "Crear Cuenta" : "Bienvenido a Wingx"}
                    </h1>
                    <p className="text-slate-400">
                        {isRegistering ? "Empieza a gestionar tu taller hoy" : "Gestiona tus costuras y pedidos"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {isRegistering && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Nombre</label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu Nombre"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-950 text-white placeholder-slate-500 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-950 text-white placeholder-slate-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-950 text-white placeholder-slate-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? (
                            "Procesando..."
                        ) : isRegistering ? (
                            <> <UserPlus size={20} /> Registrarse </>
                        ) : (
                            <> <LogIn size={20} /> Iniciar Sesión </>
                        )}
                    </button>
                </form>

                <div className="border-t border-slate-800 pt-6 text-center">
                    <p className="text-slate-500 text-sm">
                        {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta aún?"}
                    </p>
                    <button
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError("");
                            setEmail("");
                            setPassword("");
                        }}
                        className="text-blue-500 hover:text-blue-400 font-semibold text-sm mt-1 transition-colors"
                    >
                        {isRegistering ? "Inicia Sesión aquí" : "Regístrate gratis"}
                    </button>
                </div>
            </div>
        </div>
    );
}
