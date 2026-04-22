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
  link?: string;
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

const postsPath = path.join(process.cwd(), "public", "posts.json");

const analystNamePattern =
  /(AI\s*(수석\s*)?분석관|AI\s*정책\s*분석기|지능형\s*분석\s*리서치|초거대\s*AI\s*기반\s*지능형\s*분석)/gi;

function cleanText(value: string): string {
  return value
    .replace(analystNamePattern, "정책 리서치")
    .replace(/Premium Research/gi, "Policy Research")
    .replace(/프리미엄\s*분석/g, "심층 분석")
    .trim();
}

function cleanPost(post: FullPost): FullPost {
  return {
    id: post.id,
    cat: post.cat,
    catName: post.catName,
    date: post.date,
    headline: cleanText(post.headline),
    source: cleanText(post.source),
    sourceUrl: post.sourceUrl || post.link || "",
    link: post.link,
    summary: post.summary.map(cleanText),
    evidenceText: post.evidenceText ? cleanText(post.evidenceText) : undefined,
    regionalImpact: post.regionalImpact ? cleanText(post.regionalImpact) : undefined,
    yieldImpact: post.yieldImpact ? cleanText(post.yieldImpact) : undefined,
    keyData: post.keyData.map((item) => ({
      항목: cleanText(item.항목),
      수치: cleanText(item.수치),
      적용대상: cleanText(item.적용대상),
    })),
    checklist: post.checklist.map(cleanText),
    expertOpinions: post.expertOpinions.map((opinion) => ({
      name: "정책 리서치",
      affiliation: "원문 기반 정책 검토",
      comment: cleanText(opinion.comment),
    })),
  };
}

export async function loadFullPosts(): Promise<FullPost[]> {
  const file = await readFile(postsPath, "utf-8");
  const posts = JSON.parse(file) as FullPost[];

  return posts.map(cleanPost);
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
