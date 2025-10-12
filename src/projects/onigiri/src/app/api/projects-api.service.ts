import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CustomUrlProjectLinkData, ProjectData, ProjectInfo, ProjectTask } from '@onigiri-models';
import * as A from 'fp-ts/es6/Array';
import { Observable, map } from 'rxjs';
import {
  CustomUrlProjectLinkDataDto, ProjectCreateResultDto,
  ProjectDto,
  ProjectInfoDto, ProjectLinkDto,
  toProject,
  toProjectDataDto, toProjectInfo,
  toProjectTaskDto
} from './dtos/projects';
import { APP_CONFIG } from '@oni-shared';


@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  #http = inject(HttpClient);
  #onigiriApi = inject(APP_CONFIG).onigiriApi;

  getActiveProjects(): Observable<ProjectInfo[]> {
    return this.#http.get<ProjectInfoDto[]>(`${this.#onigiriApi}/api/projects/active`)
      .pipe(map(A.map(toProjectInfo)));
  }

  getCompletedProjects(): Observable<ProjectInfo[]> {
    return this.#http.get<ProjectInfoDto[]>(`${this.#onigiriApi}/api/projects/completed`)
      .pipe(map(A.map(toProjectInfo)));
  }

  getProject(id: string) {
    return this.#http.get<ProjectDto>(`${this.#onigiriApi}/api/projects/${id}`)
      .pipe(map(toProject));
  }


  addCustomUrlProjectLink(projectId: string, data: CustomUrlProjectLinkData) {
    const payload: CustomUrlProjectLinkDataDto = {
      url: data.url,
      description: data.description,
      icon: data.icon,
      title: data.title
    };

    return this.#http.post<ProjectLinkDto>(`${this.#onigiriApi}/api/projects/${projectId}/links/custom-url`, payload)
      .pipe(map(x => x.id));
  }

  createProject(data: ProjectData) {
    const payload = toProjectDataDto(data);
    return this.#http.post<ProjectCreateResultDto>(`${this.#onigiriApi}/api/projects`, payload)
      .pipe(map(x => x.id));
  }

  updateDetails(id: string, data: ProjectData) {
    const payload = toProjectDataDto(data);
    return this.#http.patch<void>(`${this.#onigiriApi}/api/projects/${id}/details`, payload);
  }

  updateTasks(id: string, data: ProjectTask[]) {
    const payload = data.map(toProjectTaskDto);
    return this.#http.patch<void>(`${this.#onigiriApi}/api/projects/${id}/tasks`, payload);
  }

  completeProject(id: string) {
    return this.#http.put<void>(`${this.#onigiriApi}/api/projects/${id}/complete`, null);
  }

  restoreProject(id: string) {
    return this.#http.patch<void>(`${this.#onigiriApi}/api/projects/${id}/restore`, null);
  }

  deleteProject(id: string) {
    return this.#http.delete<void>(`${this.#onigiriApi}/api/projects/${id}`);
  }
}

