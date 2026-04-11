import { readFile } from "node:fs/promises";
import path from "node:path";

export interface FullPost {
  id: string;
  cat: string;
  catName?: string;
  date: string;
  headline: string;
  source: string;
  sourceUrl: string;
  summary: string[];
  expertOpinions: Array<{ name: string; affiliation: string; comment: string }>;
  keyData: Array<{ 항목: string; 수치: string; 적용대상: string }>;
  checklist: string[];
  regionalImpact?: string;
  yieldImpact?: string;
  evidenceText?: string;
}

export interface PublicPost {
  id: string;
  cat: string;
  catName?: string;
  date: string;
  headline: string;
  source: string;
  sourceUrl: string;
  summary: string[];
  evidenceText?: string;
}

export interface PremiumPostPayload {
  expertOpinions: FullPost["expertOpinions"];
  keyData: FullPost["keyData"];
  checklist: FullPost["checklist"];
  regionalImpact?: string;
  yieldImpact?: string;
}

const postsPath = path.join(process.cwd(), "posts.json");

export async function loadFullPosts(): Promise<FullPost[]> {
  const file = await readFile(postsPath, "utf-8");
  const posts = JSON.parse(file) as FullPost[];

  return posts;
}

export function toPublicPost(post: FullPost): PublicPost {
  return {
    id: post.id,
    cat: post.cat,
    catName: post.catName,
    date: post.date,
    headline: post.headline,
    source: post.source,
    sourceUrl: post.sourceUrl,
    summary: post.summary,
    evidenceText: post.evidenceText,
  };
}

export function toPremiumPost(post: FullPost): PremiumPostPayload {
  return {
    expertOpinions: post.expertOpinions,
    keyData: post.keyData,
    checklist: post.checklist,
    regionalImpact: post.regionalImpact,
    yieldImpact: post.yieldImpact,
  };
}

export async function getPublicPosts(): Promise<PublicPost[]> {
  const posts = await loadFullPosts();

  return posts.map(toPublicPost);
}

export async function getFullPostById(postId: string): Promise<FullPost | null> {
  const posts = await loadFullPosts();
  return posts.find((post) => post.id === postId) ?? null;
}
