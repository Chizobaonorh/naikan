import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Environment, Page, Pageables} from '../../shared';
import {OverviewTopGroups} from '../overview-top-groups';
import {OverviewGroup} from "../overview";
import {TableLazyLoadEvent} from "primeng/table";

const endpoint = 'overview/environments';

@Injectable()
export class EnvironmentService {

  constructor(private readonly http: HttpClient) {
  }

  getOverviews(event?: TableLazyLoadEvent): Observable<Page<OverviewGroup<Environment>>> {
    return this.http.get<Page<OverviewGroup<Environment>>>(`/${endpoint}`, {params: Pageables.toPageRequestHttpParams(event)});
  }

  getTopGroups(): Observable<OverviewTopGroups> {
    return this.http.get<OverviewTopGroups>(`/${endpoint}/top`);
  }
}