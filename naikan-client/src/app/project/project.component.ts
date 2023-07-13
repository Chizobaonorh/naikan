import {Component, OnInit, ViewChild} from '@angular/core';
import {SelectItem, SharedModule} from 'primeng/api';
import {ProjectService} from './project.service';
import {Bom, Page, Search} from '../shared';
import {ProjectOverview} from './project-overview';
import {DatePipe, NgClass} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ProjectFilter} from './project-filter';
import {Table, TableLazyLoadEvent, TableModule} from 'primeng/table';
import {InputSwitchModule, InputSwitchOnChangeEvent} from "primeng/inputswitch";
import {FormsModule} from "@angular/forms";
import {TooltipModule} from "primeng/tooltip";

@Component({
  templateUrl: './project.component.html',
  standalone: true,
  imports: [TableModule, SharedModule, ProjectFilter, Search, ButtonModule, InputSwitchModule, DropdownModule, NgClass, ProjectOverview, InputSwitchModule, FormsModule, TooltipModule],
  providers: [ProjectService, DatePipe]
})
export class ProjectComponent implements OnInit {

  private readonly FAVORITES_KEY = "project-favorites";

  @ViewChild('projectsTable', {static: true}) projectsTable: Table;
  page: Page<Bom>;
  sortOptions: SelectItem[];
  sortField: string;
  sortOrder: number;
  favorites: boolean;

  constructor(private readonly projectService: ProjectService) {
  }

  ngOnInit(): void {
    this.favorites = localStorage.getItem(this.FAVORITES_KEY) === 'true';
    this.initTableSort();
  }

  onSortChange(event): void {
    this.sortField = event.value;
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === -1 ? 1 : -1;
  }

  toggleFavorites(event: InputSwitchOnChangeEvent): void {
    localStorage.setItem(this.FAVORITES_KEY, String(event.checked));
    this.loadProjects(this.projectsTable.createLazyLoadMetadata());
  }

  loadProjects(event?: TableLazyLoadEvent): void {
    this.projectService.getBoms(event, this.favorites)
    .subscribe(data => this.page = data);
  }

  private initTableSort(): void {
    this.sortOptions = [
      {label: 'Name ', value: 'project.name'},
      {label: 'Last updated', value: 'timestamp'},
      {label: 'Group', value: 'project.groupId'},
      {label: 'Artifact', value: 'project.artifactId'},
      {label: 'Packaging', value: 'project.packaging'},
      {label: 'Version', value: 'project.version'},
      {label: 'Environments', value: 'environmentsCount'},
      {label: 'Teams', value: 'teamsCount'},
      {label: 'Developers', value: 'developersCount'},
      {label: 'Contacts', value: 'contactsCount'},
      {label: 'Integrations', value: 'integrationsCount'},
      {label: 'Technologies', value: 'technologiesCount'},
      {label: 'Deployments', value: 'deploymentsCount'}
    ];
    this.sortField = this.sortOptions[0].value;
    this.sortOrder = 1;
  }
}