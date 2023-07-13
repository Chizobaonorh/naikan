import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Clipboard} from '@angular/cdk/clipboard';
import {finalize, Subscription} from 'rxjs';
import {LayoutService} from '../../layout/app.layout.service';
import {
  Bom,
  Breadcrumb,
  Charts,
  DateTimePipe,
  Deployment,
  NaikanTags,
  ProjectVersion,
  Search,
  Url
} from '../../shared';
import {ProjectService} from '../project.service';
import {MenuItem, SharedModule} from "primeng/api";
import {ChartModule} from 'primeng/chart';
import {TagModule} from 'primeng/tag';
import {TableModule} from 'primeng/table';
import {TooltipModule} from 'primeng/tooltip';
import {ButtonModule} from 'primeng/button';
import {TabViewModule} from 'primeng/tabview';
import {DatePipe, NgFor, NgIf} from '@angular/common';

interface GroupedDeploymentPerVersion {
  version: string;
  deploymentsCount: number;
  deployments: Deployment[];
}

interface LatestVersionPerEnvironment {
  environment: string;
  deployment: Deployment;
}

@Component({
  templateUrl: './project-detail.component.html',
  standalone: true,
  imports: [NgIf, Breadcrumb, TabViewModule, Url, ProjectVersion, NaikanTags, ButtonModule, TooltipModule, TableModule, SharedModule, Search, NgFor, TagModule, ChartModule, DatePipe, DateTimePipe],
  providers: [ProjectService, DatePipe]
})
export class ProjectDetailComponent implements OnInit, OnDestroy {

  protected readonly Object = Object;

  id: string;
  bom: Bom;
  groupedDeploymentsPerVersion: GroupedDeploymentPerVersion[];
  latestVersionPerEnvironment: LatestVersionPerEnvironment[];
  chartData = {labels: [], datasets: []} as any;
  chartOptions: any;
  subscription!: Subscription;
  expandedVersionRows = {};
  items: MenuItem[];

  constructor(private readonly route: ActivatedRoute,
              private readonly projectService: ProjectService,
              private readonly layoutService: LayoutService,
              private readonly clipboard: Clipboard) {

    this.subscription = this.layoutService.configUpdate$.subscribe(() => {
      this.initChart();
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadBom(this.id);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  copyToClipboard(value: HTMLElement): void {
    const text: string = value.textContent || '';
    this.clipboard.copy(text);
  }

  expandVersions(): void {
    if (this.expandedVersionRows && Object.keys(this.expandedVersionRows).length) {
      this.expandedVersionRows = {};
    } else {
      for (const version of this.groupedDeploymentsPerVersion) {
        this.expandedVersionRows[version.version] = true;
      }
    }
  }

  private loadBom(id: string): void {
    this.projectService.getBom(id)
    .pipe(finalize(() => {
      this.items = [{label: this.bom.project.name}];
      this.initChart();
      this.initGroupedDeploymentsPerVersion();
      this.initLatestVersionPerEnvironment();
    }))
    .subscribe(data => {
      this.bom = data
    });
  }

  private initChart(): void {
    if (this.bom?.deployments) {
      const documentStyle = Charts.documentStyle();
      const environments = {} as any;

      this.bom.deployments.forEach(deployment => {
        const environment = deployment.environment ? deployment.environment : 'unknown';

        if (!environments[environment]) {
          environments[environment] = [];
        }
        environments[environment].push(deployment);
      });

      this.chartData = {
        labels: Object.keys(environments).slice(0, 5),
        datasets: [
          {
            label: "Deployments",
            data: Object.keys(environments).flatMap(environment => environments[environment].length).slice(0, 5),
            backgroundColor: documentStyle,
            borderColor: documentStyle,
          }
        ]
      };
    }

    this.chartOptions = {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Top 5 Environments'
        }
      },
      scale: {
        ticks: {
          precision: 0
        }
      },
      animation: {
        duration: 0
      },
      indexAxis: 'y'
    };
  }

  private initGroupedDeploymentsPerVersion(): void {
    this.groupedDeploymentsPerVersion = Object.entries(
        this.bom.deployments.reduce((result: {
          [version: string]: Deployment[]
        }, deployment: Deployment) => {
          const version = deployment.version ? deployment.version : 'unknown';

          if (!result[version]) {
            result[version] = [];
          }
          result[version].push(deployment);
          return result;
        }, {})
    ).map(([version, deployments]) => ({
      version,
      deploymentsCount: deployments ? deployments.length : 0,
      deployments: deployments.sort((a, b) => {
        return +new Date(b.timestamp) - +new Date(a.timestamp)
      })
    }));
  }

  private initLatestVersionPerEnvironment(): void {
    this.latestVersionPerEnvironment = Object.entries(
        this.bom.deployments.reduce((result: {
          [version: string]: Deployment
        }, deployment: Deployment) => {
          const environment = deployment.environment ? deployment.environment : 'unknown';

          if (!result[environment] || deployment.timestamp > result[environment].timestamp) {
            result[environment] = deployment;
          }
          return result;
        }, {})
    ).map(([environment, deployment]) => ({
      environment,
      deployment
    })).sort((a, b) => {
      return +new Date(b.deployment.timestamp) - +new Date(a.deployment.timestamp)
    });
  }
}