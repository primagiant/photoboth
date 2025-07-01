import Link from "next/link";

export default function Dashboard() {
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <Link href={`/photo`} className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-md">
                Start Photoboth
            </Link>
        </div>
    );
}
