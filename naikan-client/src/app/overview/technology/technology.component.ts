import {Component} from '@angular/core';
import {LayoutService} from 'src/app/layout/app.layout.service';
import {TechnologyService} from './technology.service';
import {Breadcrumb, Charts, Search, Technology} from '../../shared';
import {SharedModule} from 'primeng/api';
import {AbstractOverviewComponent} from "../abstract-overview.component";
import {OverviewProjectTable} from '../overview-project-table';
import {TagModule} from 'primeng/tag';
import {TooltipModule} from 'primeng/tooltip';
import {ButtonModule} from 'primeng/button';
import {TableLazyLoadEvent, TableModule} from 'primeng/table';
import {ChartModule} from 'primeng/chart';
import {DatePipe, NgIf} from '@angular/common';
import {OverviewGroup} from "../overview";

@Component({
  templateUrl: './technology.component.html',
  standalone: true,
  imports: [
    Breadcrumb,
    NgIf,
    ChartModule,
    TableModule,
    SharedModule,
    Search,
    ButtonModule,
    TooltipModule,
    TagModule,
    OverviewProjectTable,
  ],
  providers: [TechnologyService, DatePipe]
})
export class TechnologyComponent extends AbstractOverviewComponent<OverviewGroup<Technology>> {

  constructor(private readonly technologyService: TechnologyService, layoutService: LayoutService) {
    super(layoutService);
  }

  loadOverviews(event?: TableLazyLoadEvent): void {
    this.technologyService.getOverviews(event)
    .subscribe(data => this.page = data);
  }

  override initChart(): void {
    this.technologyService.getTopGroups()
    .subscribe(data => {
      if (data) {
        const documentStyle = Charts.documentStyle();

        this.chartData = {
          labels: data.names,
          datasets: [
            {
              label: "Projects",
              data: data.counts,
              backgroundColor: documentStyle,
              borderColor: documentStyle
            }
          ]
        };

        Object.assign(this.chartOptions.plugins.title, {'text': 'Top 5 Technologies'});
      }
    });
  }
}