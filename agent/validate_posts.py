import argparse
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from agent.post_processor import load_posts, normalize_posts, save_posts, validate_posts


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and optionally normalize Policy Radar posts.json")
    parser.add_argument("--file", default="public/posts.json", help="Target JSON file path")
    parser.add_argument("--fix", action="store_true", help="Normalize and write fixes before validation")
    args = parser.parse_args()

    posts = load_posts(args.file)
    warnings: list[str] = []

    if args.fix:
        posts, warnings = normalize_posts(posts)
        save_posts(posts, args.file)

    issues = validate_posts(posts)

    if warnings:
        print(f"[posts] normalized with {len(warnings)} warning(s)")
        for warning in warnings[:20]:
            print(f"  - {warning}")
        if len(warnings) > 20:
            print(f"  - ... {len(warnings) - 20} more")

    if issues:
        print(f"[posts] validation failed with {len(issues)} issue(s)")
        for issue in issues[:50]:
            print(f"  - {issue}")
        if len(issues) > 50:
            print(f"  - ... {len(issues) - 50} more")
        return 1

    print(f"[posts] validation passed ({len(posts)} posts)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
