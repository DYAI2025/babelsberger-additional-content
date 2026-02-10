# Feature Spec: Advanced Pillar-Page & Complete Site

## Overview
Build an advanced, monetizable pillar-page system for local places with multipage detail views, using JSON-driven content, web-optimized images, consent-aware ads, and SEO schema.

## Objectives
- Launch a working v1 for **Park Babelsberg** with multipage structure.
- Enable fast cloning for future places via JSON.
- Maximize Page-RPM while preserving UX (CLS-safe, LCP-friendly).

## Actors
- Visitor (mobile-first)
- Operator (content maintainer)
- Ad Network (consent-based)
- Consent Manager (CMP)

## Functional Requirements
1. Render a place index with H1, persona badges, highlight cards linking to spots. **Acceptance**: HTML contains cards with names and tags; links resolve (200) to spot pages.
2. Spot pages show hero, description, local rule & tip, and at least one image. **Acceptance**: Spot page HTML includes fields and an `<img>` gallery.
3. JSON-LD includes WebPage + Place + ItemList on index, and WebPage + Place on spot pages. **Acceptance**: `<script type="application/ld+json">` present with specified types.
4. Ads: Auto-Ads enabled globally; optional manual slots `under_hero` and `mid_cards` reserve height to avoid CLS. **Acceptance**: DOM contains reserved ad containers when enabled.
5. CMP: Load consent script stub; production allows swapping to provider. **Acceptance**: CMP script tag present; console logs stub active.
6. Sitemap and robots.txt generated, sitemap links to all built HTML files. **Acceptance**: `sitemap.xml` enumerates generated URLs; `robots.txt` includes sitemap.

## Non-Functional Requirements
- LCP <= 2.5s on 4G; CLS < 0.1 via reserved ad heights and preloaded hero.
- Mobile-first responsive grid; image lazy-loading on cards.
- Accessibility: alt texts from manifest or filename heuristics.

## User Scenarios
- As a visitor, I scan highlights and open a spot to decide if it's worth a visit.
- As a visitor, I check rules and arrival info to plan my trip.
- As an operator, I add a new place by writing one JSON file and adding images.

## Success Criteria
- Working v1 deployed with >= 3 highlight cards and >= 1 spot.
- Core Web Vitals targets met (LCP <= 2.5s, CLS < 0.1) on test device.
- Page-RPM-ready: Auto-Ads active; viewability slots present.
- Sitemap indexed; JSON-LD valid in Rich Results Test.

## Assumptions
- Images provided or placeholders acceptable for v1.
- AdSense client ID will be replaced in production.
- CMP stub suffices until provider integration.

## Risks
- Missing images degrade aesthetics.
- CMP misconfiguration can block ads.
- Over-aggressive ads hurt UX and viewability.

## Dependencies
- Place JSON, CSS theme, templates, image pipeline.
