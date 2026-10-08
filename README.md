# Civix_Group_1
```
tested
├─ backend
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ src
│  │  ├─ app.js
│  │  ├─ config
│  │  │  └─ db.js
│  │  ├─ controllers
│  │  │  ├─ auth.controller.js
│  │  │  ├─ dashboard.controller.js
│  │  │  ├─ petition.controller.js
│  │  │  └─ poll.controller.js
│  │  ├─ middleware
│  │  │  ├─ auth.middleware.js
│  │  │  ├─ error.middleware.js
│  │  │  ├─ role.middleware.js
│  │  │  └─ validate.middleware.js
│  │  ├─ models
│  │  │  ├─ petition.model.js
│  │  │  ├─ poll.model.js
│  │  │  ├─ signature.model.js
│  │  │  ├─ user.model.js
│  │  │  └─ vote.model.js
│  │  ├─ routes
│  │  │  ├─ auth.routes.js
│  │  │  ├─ dashboard.routes.js
│  │  │  ├─ index.js
│  │  │  ├─ petition.routes.js
│  │  │  └─ poll.routes.js
│  │  ├─ server.js
│  │  ├─ services
│  │  │  ├─ auth.service.js
│  │  │  ├─ dashboard.service.js
│  │  │  ├─ petition.service.js
│  │  │  └─ poll.service.js
│  │  ├─ utils
│  │  │  ├─ response.js
│  │  │  └─ token.js
│  │  └─ validators
│  │     ├─ auth.validator.js
│  │     ├─ petition.validator.js
│  │     └─ poll.validator.js
│  └─ tests
│     ├─ auth.test.js
│     ├─ petition.test.js
│     └─ poll.test.js
├─ frontend
│  ├─ .angular
│  │  └─ cache
│  │     └─ 21.2.22
│  │        └─ frontend
│  │           ├─ .tsbuildinfo
│  │           └─ vite
│  │              └─ deps
│  │                 ├─ @angular_common.js
│  │                 ├─ @angular_common.js.map
│  │                 ├─ @angular_common_http.js
│  │                 ├─ @angular_common_http.js.map
│  │                 ├─ @angular_core.js
│  │                 ├─ @angular_core.js.map
│  │                 ├─ @angular_forms.js
│  │                 ├─ @angular_forms.js.map
│  │                 ├─ @angular_platform-browser.js
│  │                 ├─ @angular_platform-browser.js.map
│  │                 ├─ @angular_router.js
│  │                 ├─ @angular_router.js.map
│  │                 ├─ chunk-2FPN462P.js
│  │                 ├─ chunk-2FPN462P.js.map
│  │                 ├─ chunk-5EALC7RR.js
│  │                 ├─ chunk-5EALC7RR.js.map
│  │                 ├─ chunk-JNUBSORW.js
│  │                 ├─ chunk-JNUBSORW.js.map
│  │                 ├─ chunk-PJVWDKLX.js
│  │                 ├─ chunk-PJVWDKLX.js.map
│  │                 ├─ chunk-TMVPVQRR.js
│  │                 ├─ chunk-TMVPVQRR.js.map
│  │                 ├─ chunk-WLX7ZQBF.js
│  │                 ├─ chunk-WLX7ZQBF.js.map
│  │                 ├─ package.json
│  │                 ├─ rxjs.js
│  │                 ├─ rxjs.js.map
│  │                 └─ _metadata.json
│  ├─ .editorconfig
│  ├─ .prettierrc
│  ├─ angular.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ favicon.ico
│  ├─ README.md
│  ├─ src
│  │  ├─ app
│  │  │  ├─ app.config.ts
│  │  │  ├─ app.css
│  │  │  ├─ app.html
│  │  │  ├─ app.routes.ts
│  │  │  ├─ app.spec.ts
│  │  │  ├─ app.ts
│  │  │  ├─ guards
│  │  │  │  └─ auth.guard.ts
│  │  │  ├─ interceptors
│  │  │  │  └─ auth.interceptor.ts
│  │  │  ├─ models
│  │  │  │  └─ api.models.ts
│  │  │  ├─ pages
│  │  │  │  ├─ dashboard
│  │  │  │  │  ├─ dashboard.component.css
│  │  │  │  │  ├─ dashboard.component.html
│  │  │  │  │  └─ dashboard.component.ts
│  │  │  │  ├─ home
│  │  │  │  │  ├─ home.component.css
│  │  │  │  │  ├─ home.component.html
│  │  │  │  │  └─ home.component.ts
│  │  │  │  ├─ login
│  │  │  │  │  ├─ login.component.css
│  │  │  │  │  ├─ login.component.html
│  │  │  │  │  └─ login.component.ts
│  │  │  │  ├─ officials
│  │  │  │  │  ├─ officials.css
│  │  │  │  │  ├─ officials.html
│  │  │  │  │  └─ officials.ts
│  │  │  │  ├─ petitions
│  │  │  │  │  ├─ petitions.component.css
│  │  │  │  │  ├─ petitions.component.html
│  │  │  │  │  └─ petitions.component.ts
│  │  │  │  ├─ poll-result
│  │  │  │  │  ├─ poll-results.component.css
│  │  │  │  │  ├─ poll-results.component.html
│  │  │  │  │  └─ poll-results.component.ts
│  │  │  │  ├─ polls
│  │  │  │  │  ├─ polls.component.css
│  │  │  │  │  ├─ polls.component.html
│  │  │  │  │  └─ polls.component.ts
│  │  │  │  ├─ profile
│  │  │  │  │  ├─ profile.component.css
│  │  │  │  │  ├─ profile.component.html
│  │  │  │  │  └─ profile.component.ts
│  │  │  │  ├─ register
│  │  │  │  │  ├─ register.component.css
│  │  │  │  │  ├─ register.component.html
│  │  │  │  │  └─ register.component.ts
│  │  │  │  ├─ reports
│  │  │  │  │  ├─ reports.component.css
│  │  │  │  │  ├─ reports.component.html
│  │  │  │  │  └─ reports.component.ts
│  │  │  │  └─ settings
│  │  │  │     ├─ settings.component.css
│  │  │  │     ├─ settings.component.html
│  │  │  │     └─ settings.component.ts
│  │  │  └─ services
│  │  │     ├─ auth.service.ts
│  │  │     ├─ dashboard.service.ts
│  │  │     └─ poll.service.ts
│  │  ├─ assets
│  │  │  ├─ civix-civic-city-background.svg
│  │  │  └─ civix-civic-city-hero.svg
│  │  ├─ index.html
│  │  ├─ main.ts
│  │  └─ styles.css
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  └─ tsconfig.spec.json
├─ project_structure.txt
└─ README.md

```