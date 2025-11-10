import { Clock, Car, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/customer";
import { formatDuration, formatDate } from "@/hooks/useCustomerProjects";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
          <Badge className="bg-success text-success-foreground whitespace-nowrap">
            ✓ Fullført
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(project.created_at)}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(project.total_duration_seconds)}</span>
          </div>
          
          {project.total_kilometers > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Car className="h-4 w-4" />
              <span>{project.total_kilometers} km</span>
            </div>
          )}
          
          {project.material_count > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{project.material_count}</span>
            </div>
          )}
        </div>
        
        {project.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
