import { FormEvent, useState } from 'react';
import { Button } from '@/components/button/button';
import { Logo } from '@/components/logo/logo';
import { handleError } from '@/shared/helpers/handle-error';
import { notifySuccess } from '@/shared/helpers/notify';
import { useAuth } from '@/shared/context/auth-context';
import { Mail, Lock, User, Shield, MapPin } from 'lucide-react';
import styles from './auth.screen.module.css';

export function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login, signup, loading } = useAuth();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (isLogin) {
                await login(email, password);
                notifySuccess('Login realizado');
            } else {
                await signup(name, email, password);
                notifySuccess('Conta criada');
            }
        } catch (error) {
            handleError(error);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <Shield size={28} className={styles.loadingIcon} />
                <span className={styles.loadingText}>Carregando...</span>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <section className={styles.heroSection}>
                <div className={styles.heroTop}>
                    <Logo />
                </div>

                <div className={styles.heroContent}>
                    <div className={styles.kicker}>
                        <span className={styles.kickerDot} />
                        SEGURANÇA COLABORATIVA
                    </div>
                    <h1 className={styles.heroTitle}>
                        Mais atentos.<br />
                        <span>Mais seguros.</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Compartilhe alertas da sua região e ajude sua comunidade a se mover com mais segurança.
                    </p>
                </div>

                <div className={styles.heroFooter}>
                    <div className={styles.footerCity}>
                        <MapPin size={14} className={styles.footerIcon} />
                        <span>Feito para sua cidade</span>
                    </div>
                    <span className={styles.footerCopy}>© 2026  Alerta</span>
                </div>
            </section>

            {/* Coluna Direita - Formulário */}
            <section className={styles.formSection}>
                <div className={styles.formCard}>
                    <header className={styles.formHeader}>
                        <h2 className={styles.formTitle}>
                            {isLogin ? 'Entre na sua conta' : 'Crie a sua conta'}
                        </h2>
                        <p className={styles.formSubtitle}>
                            {isLogin
                                ? 'Acompanhe os alertas perto de você.'
                                : 'Cadastre-se para começar a colaborar'}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {!isLogin && (
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Nome completo</label>
                                <div className={styles.fieldBox}>
                                    <User size={16} className={styles.fieldIcon} />
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Seu nome completo"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>E-mail</label>
                            <div className={styles.fieldBox}>
                                <Mail size={16} className={styles.fieldIcon} />
                                <input
                                    type="email"
                                    className={styles.input}
                                    placeholder="voce@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Senha</label>
                            <div className={styles.fieldBox}>
                                <Lock size={16} className={styles.fieldIcon} />
                                <input
                                    type="password"
                                    className={styles.input}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            className={styles.submitBtn}
                            disabled={submitting}
                        >
                            {isLogin ? 'Entrar na conta' : 'Cadastre-se →'}
                        </Button>
                    </form>

                    <footer className={styles.toggleFooter}>
                        {isLogin ? (
                            <p>
                                Ainda não tem uma conta?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(false)}
                                    className={styles.toggleBtn}
                                >
                                    Cadastre-se
                                </button>
                            </p>
                        ) : (
                            <p>
                                Já tem uma conta?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(true)}
                                    className={styles.toggleBtn}
                                >
                                    Entrar
                                </button>
                            </p>
                        )}

                        <div className={styles.securityNotice}>
                            <Shield size={13} className={styles.securityIcon} />
                            <span>Seus dados são protegidos e usados apenas para manter a comunidade segura.</span>
                        </div>
                    </footer>
                </div>
            </section>
        </div>
    );
}