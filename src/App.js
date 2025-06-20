import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ===================================================================
// ESTILOS (sem alterações)
// ===================================================================
const styles = {
    theme: {
        colors: {
            primary: '#4F46E5', primaryHover: '#4338CA',
            secondary: '#DC2626', secondaryHover: '#B91C1C',
            text: '#1F2937', textLight: '#6B7280', white: '#FFFFFF',
            border: '#E5E7EB', success: '#16A34A', danger: '#DC2626',
            lightGray: '#F9FAFB', background: '#f7fafc',
        }
    },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: '0.5rem', padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    button: {
        width: '100%', padding: '0.75rem 1rem', fontWeight: 500, color: '#FFFFFF',
        backgroundColor: '#4F46E5', border: 'none', borderRadius: '0.5rem',
        cursor: 'pointer', transition: 'background-color 0.2s',
    },
    input: {
        width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB',
        borderRadius: '0.5rem', boxSizing: 'border-box',
    },
    buttonDisabled: { backgroundColor: '#A5B4FC', cursor: 'not-allowed' }
};

const Button = ({ children, style, disabled, ...props }) => {
    const [isHovered, setIsHovered] = useState(false);
    const combinedStyle = {
        ...styles.button,
        ...(isHovered && !disabled ? { backgroundColor: styles.theme.colors.primaryHover } : {}),
        ...(disabled ? styles.buttonDisabled : {}),
        ...style,
    };
    return (
        <button style={combinedStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} disabled={disabled} {...props}>
            {children}
        </button>
    );
};

// ===================================================================
// LÓGICA DE API (sem alterações)
// ===================================================================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('jwt_token');
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    const config = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 204) return null;
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ocorreu um erro na comunicação com o servidor.' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

// ===================================================================
// AUTENTICAÇÃO (Contexto e Provedor - CORRIGIDO)
// ===================================================================
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    // O estado inicial lê diretamente do localStorage, o que é ótimo para recarregar a página.
    const [token, setToken] = useState(localStorage.getItem('jwt_token'));

    const login = async (username, password) => {
        const data = await apiRequest('/auth/login', 'POST', { username, password });
        // CORREÇÃO: Salva no localStorage *antes* de atualizar o estado.
        // Isso garante que qualquer requisição disparada pela mudança de estado já encontre o token.
        localStorage.setItem('jwt_token', data.token);
        setToken(data.token);
    };

    const register = async (username, password) => {
        await apiRequest('/auth/registrar', 'POST', { username, password });
    };

    const logout = () => {
        // CORREÇÃO: Remove do localStorage *antes* de atualizar o estado.
        localStorage.removeItem('jwt_token');
        setToken(null);
    };

    // O useEffect que sincronizava o estado com o localStorage foi removido
    // pois agora a sincronização é feita diretamente nas funções de login/logout,
    // o que é mais robusto contra "race conditions".

    const value = { isAuthenticated: !!token, login, register, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);


// ===================================================================
// PÁGINAS E COMPONENTES (sem alterações)
// ===================================================================

// --- Página de Login/Registro ---
const LoginPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLoginView) {
                await login(username, password);
            } else {
                await register(username, password);
                alert('Registro bem-sucedido! Por favor, faça o login.');
                setIsLoginView(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: styles.theme.colors.background }}>
            <div style={{ ...styles.card, width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: styles.theme.colors.text, marginBottom: '1.5rem' }}>
                    {isLoginView ? 'Login no Foco Financeiro' : 'Crie sua Conta'}
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <input style={styles.input} type="text" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} required />
                    <input style={styles.input} type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
                    {error && <p style={{ color: styles.theme.colors.danger, fontSize: '0.875rem' }}>{error}</p>}
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Processando...' : (isLoginView ? 'Entrar' : 'Registrar')}
                    </Button>
                </form>
                <p style={{ fontSize: '0.875rem', color: styles.theme.colors.textLight, marginTop: '1.5rem' }}>
                    {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button onClick={() => setIsLoginView(!isLoginView)} style={{ marginLeft: '0.25rem', fontWeight: '500', color: styles.theme.colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
                        {isLoginView ? 'Registre-se' : 'Faça Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// --- Página do Painel (Dashboard) ---
const DashboardPage = () => {
    const { logout } = useAuth();
    const [categorias, setCategorias] = useState([]);
    const [lancamentos, setLancamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados dos formulários
    const [formState, setFormState] = useState({
        nomeCategoria: '',
        descLancamento: '',
        valorLancamento: '',
        tipoLancamento: 'CUSTO',
        categoriaLancamentoId: '',
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const fetchData = useCallback(async () => {
        try {
            const [catData, lancData] = await Promise.all([
                apiRequest('/categoria'),
                apiRequest('/lancamento')
            ]);
            setCategorias(catData);
            setLancamentos(lancData.sort((a, b) => new Date(b.data) - new Date(a.data)));
            if (catData.length > 0 && !formState.categoriaLancamentoId) {
                setFormState(prev => ({ ...prev, categoriaLancamentoId: catData[0].id }));
            }
        } catch (err) {
            alert(`Erro ao carregar dados: ${err.message}`);
            if (err.message.toLowerCase().includes('token')) logout(); // Desloga se for erro de token
        } finally {
            setLoading(false);
        }
    }, [formState.categoriaLancamentoId, logout]);

    useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

    const handleAddCategoria = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/categoria', 'POST', { nome: formState.nomeCategoria, descricao: '' });
            setFormState(prev => ({ ...prev, nomeCategoria: '' }));
            fetchData();
        } catch (err) { alert(`Erro ao adicionar categoria: ${err.message}`); }
    };
    
    const handleAddLancamento = async (e) => {
        e.preventDefault();
        if(!formState.categoriaLancamentoId) return alert('Por favor, crie e selecione uma categoria.');
        try {
            const payload = {
                descricao: formState.descLancamento,
                valor: parseFloat(formState.valorLancamento),
                tipo: formState.tipoLancamento,
                data: new Date().toISOString().split('T')[0],
                categoria: { id: parseInt(formState.categoriaLancamentoId) }
            };
            await apiRequest('/lancamento', 'POST', payload);
            setFormState(prev => ({ ...prev, descLancamento: '', valorLancamento: '' }));
            fetchData();
        } catch (err) { alert(`Erro ao adicionar lançamento: ${err.message}`); }
    };

    if (loading) return <div style={{textAlign: 'center', padding: '2rem'}}>Carregando...</div>;

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem', backgroundColor: styles.theme.colors.background }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{fontSize: '1.875rem', fontWeight: 'bold'}}>Painel Foco Financeiro</h1>
                <Button onClick={logout} style={{width: 'auto', backgroundColor: styles.theme.colors.secondary}}>Sair</Button>
            </header>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <form style={styles.card} onSubmit={handleAddCategoria}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Adicionar Categoria</h3>
                        <input name="nomeCategoria" style={styles.input} type="text" placeholder="Nome da Categoria" value={formState.nomeCategoria} onChange={handleFormChange} required />
                        <Button type="submit" style={{marginTop: '1rem'}}>Adicionar</Button>
                    </form>
                    <form style={styles.card} onSubmit={handleAddLancamento}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Adicionar Lançamento</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <input name="descLancamento" style={styles.input} type="text" placeholder="Descrição" value={formState.descLancamento} onChange={handleFormChange} required />
                            <input name="valorLancamento" style={styles.input} type="number" step="0.01" placeholder="Valor" value={formState.valorLancamento} onChange={handleFormChange} required />
                            <select name="tipoLancamento" style={styles.input} value={formState.tipoLancamento} onChange={handleFormChange}>
                                <option value="CUSTO">Custo</option>
                                <option value="GANHO">Ganho</option>
                            </select>
                            <select name="categoriaLancamentoId" style={styles.input} value={formState.categoriaLancamentoId} onChange={handleFormChange} required>
                                <option value="" disabled>Selecione uma categoria</option>
                                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                            </select>
                            <Button type="submit">Adicionar</Button>
                        </div>
                    </form>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={styles.card}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Suas Categorias</h3>
                        <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                           {categorias.length > 0 ? categorias.map(cat => <li key={cat.id} style={{padding: '0.5rem', backgroundColor: styles.theme.colors.lightGray, borderRadius: '0.25rem'}}>{cat.nome}</li>) : <p>Nenhuma categoria encontrada.</p>}
                        </ul>
                    </div>
                    <div style={styles.card}>
                         <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Últimos Lançamentos</h3>
                         <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                            {lancamentos.length > 0 ? lancamentos.map(lanc => (
                                <li key={lanc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: `1px solid ${styles.theme.colors.border}`, borderRadius: styles.theme.borderRadius }}>
                                    <div>
                                        <p style={{fontWeight: 600}}>{lanc.descricao}</p>
                                        <p style={{fontSize: '0.875rem', color: styles.theme.colors.textLight}}>{lanc.categoria.nome} - {new Date(lanc.data).toLocaleDateString()}</p>
                                    </div>
                                    <span style={{ fontWeight: 'bold', color: lanc.tipo === 'CUSTO' ? styles.theme.colors.danger : styles.theme.colors.success }}>
                                        {lanc.tipo === 'CUSTO' ? '-' : '+'} R$ {lanc.valor.toFixed(2)}
                                    </span>
                                </li>
                            )) : <p>Nenhum lançamento encontrado.</p>}
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
// 5. COMPONENTE PRINCIPAL (App)
// ===================================================================
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

const AppContent = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}
