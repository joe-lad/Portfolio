module Admin
  class ProjectsController < BaseController
    def index
      @projects = Project.order(created_at: :desc)
    end

    def new
      @project = Project.new
    end

    def create
      @project = Project.new(project_params)
      if @project.save
        redirect_to admin_projects_path, notice: "Project created."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
      @project = Project.find(params[:id])
    end

    def update
      @project = Project.find(params[:id])
      if @project.update(project_params)
        redirect_to admin_projects_path, notice: "Project updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @project = Project.find(params[:id])
      @project.destroy
      redirect_to admin_projects_path, notice: "Project deleted."
    end

    private

    def project_params
      params.require(:project).permit(:title, :subtitle, :featured, :description, :cover_photo)
    end
  end
end
