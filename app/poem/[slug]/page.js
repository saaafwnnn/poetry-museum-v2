import { getPoemBySlug } from "../../../data/poems";
import PoemReader from "../../../components/PoemReader";

export default async function PoemPage({ params }) {

  const { slug } = await params;

  const poem = getPoemBySlug(slug);

  if (!poem) {
    return <div style={{ color: "white" }}>Poem not found: {slug}</div>;
  }

  return <PoemReader poem={poem} />;
}