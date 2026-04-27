import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1>GradeProjector Demo</h1>

      <p>GPPP × WeTheHobby</p>

      <Link href="/analyze">
        <button style={{ marginTop: 20 }}>
          Start Demo
        </button>
      </Link>
    </main>
  );
}