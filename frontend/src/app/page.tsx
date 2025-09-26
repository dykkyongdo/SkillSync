export default function HomePage() {
    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">SkillSync</h1>
            <p className="mt-2 opacity-80">Welcome! Pick a page:</p>
            <ul className="mt-4 list-disc pl-6 space-y-1">
                <li><a className="underline" href="/login">Login</a></li>
                <li><a className="underline" href="/register">Register</a></li>
                <li><a className="underline" href="/groups">Groups</a></li>
            </ul>
        </main>
    );
}
