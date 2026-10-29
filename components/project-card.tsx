import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";

interface Props {
  title: string;
  description: string;
  tags: readonly string[];
  link?: string;
  wip: boolean;
  contributors: { name: string; github?: string }[];
  trophies?: string[];
}

export function ProjectCard({
  title,
  description,
  tags,
  link,
  wip,
  contributors,
  trophies = [],
}: Props) {
  return (
    <Card className="flex flex-col overflow-hidden border-0 bg-secondary/60 p-4 shadow-none">
      <CardHeader className="">
        <div className="space-y-1">
          <CardTitle className="text-lg">
            {link ? (
              <a
                href={link}
                target="_blank"
                className="inline-flex items-center gap-1 hover:underline"
              >
                {title}{" "}
                <span className="size-1 rounded-full bg-green-500"></span>
              </a>
            ) : (
              title
            )}
            {wip && (
              <Badge variant="secondary" className="ml-2">
                WIP
              </Badge>
            )}
          </CardTitle>
          <div className="hidden text-xs underline print:visible">
            {link?.replace("https://", "").replace("www.", "").replace("/", "")}
          </div>
          <CardDescription className="text-[15px] leading-snug text-gray-600">
            {description}
          </CardDescription>
          {contributors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-[13px] text-gray-600 leading-5">
                Contributors:
              </span>
              {contributors.map((contributor) => (
                <Badge
                  className="bg-background"
                  variant="outline"
                  key={contributor.name}
                >
                  <a
                    href={`https://github.com/${contributor.github}`}
                    target="_blank"
                    className="hover:underline"
                  >
                    {contributor.name}
                  </a>
                </Badge>
              ))}
            </div>
          )}
          {trophies.length > 0 && (
            <div className="flex gap-2 mt-1 items-center">
              {trophies.map((trophy) => (
                <span key={trophy} className="text-[13px] font-medium">
                  {trophy}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex">
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge className="bg-background" variant="secondary" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
