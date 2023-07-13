package com.enofex.naikan.overview.technology;

import static com.enofex.naikan.overview.technology.OverviewTechnologyController.REQUEST_PATH;

import com.enofex.naikan.Filterable;
import com.enofex.naikan.overview.OverviewGroup;
import com.enofex.naikan.overview.OverviewRequest;
import com.enofex.naikan.overview.OverviewTopGroups;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(REQUEST_PATH)
class OverviewTechnologyController {

  static final String REQUEST_PATH = OverviewRequest.PATH + "/technologies";

  private final OverviewTechnologyService overviewTechnologyService;

  OverviewTechnologyController(OverviewTechnologyService overviewTechnologyService) {
    this.overviewTechnologyService = overviewTechnologyService;
  }

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Page<OverviewGroup>> findAll(Filterable filterable,
      Pageable pageable) {
    return ResponseEntity.ok(this.overviewTechnologyService.findAll(filterable, pageable));
  }

  @GetMapping(path = "/top", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<OverviewTopGroups> findTopTechnologies() {
    return ResponseEntity.ok(this.overviewTechnologyService.findTopTechnologies());
  }
}