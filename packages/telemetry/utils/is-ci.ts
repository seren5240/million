const env = process.env;

interface Info {
  name: string | null;
  isPR?: boolean | null;
}

const info: Info = {
  name: null,
  isPR: null,
};

const init = (vendors) => {
  vendors.forEach((vendor) => {
    const envs = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
    const isCI = envs.every((obj) => checkEnv(obj));

    info[vendor.constant] = isCI;

    if (!isCI) {
      return;
    }

    info.name = vendor.name;

    switch (typeof vendor.pr) {
      case 'string':
        info.isPR = !!env[vendor.pr];
        break;
      case 'object':
        if ('env' in vendor.pr && vendor.pr.env) {
          info.isPR =
            vendor.pr.env in env && env[vendor.pr.env] !== vendor.pr.ne;
        } else if ('any' in vendor.pr) {
          info.isPR = vendor.pr.any?.some((key) => !!env[key]);
        } else {
          info.isPR = checkEnv(vendor.pr);
        }
        break;
      default:
        info.isPR = null;
    }
  });
};

export const getCI = () => info.name;

export const isCI = !!(
  env.CI !== 'false' && // Bypass all checks if CI env is explicitly set to 'false'
  (env.BUILD_ID || // Jenkins, Cloudbees
    env.BUILD_NUMBER || // Jenkins, TeamCity
    env.CI || // Travis CI, CircleCI, Cirrus CI, Gitlab CI, Appveyor, CodeShip, dsari
    env.CI_APP_ID || // Appflow
    env.CI_BUILD_ID || // Appflow
    env.CI_BUILD_NUMBER || // Appflow
    env.CI_NAME || // Codeship and others
    env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
    env.RUN_ID || // TaskCluster, dsari
    info.name ||
    false)
);

const checkEnv = (obj) => {
  if (typeof obj === 'string') return !!env[obj];

  if ('env' in obj) {
    return env[obj.env] && env[obj.env]?.includes(obj.includes);
  }
  if ('any' in obj) {
    return obj.any.some((k) => !!env[k]);
  }
  return Object.keys(obj).every((k) => env[k] === obj[k]);
};

export const VENDORS = [
  {
    name: 'Agola CI',
    constant: 'AGOLA',
    env: 'AGOLA_GIT_REF',
    pr: 'AGOLA_PULL_REQUEST_ID',
  },
  {
    name: 'Appcircle',
    constant: 'APPCIRCLE',
    env: 'AC_APPCIRCLE',
  },
  {
    name: 'AppVeyor',
    constant: 'APPVEYOR',
    env: 'APPVEYOR',
    pr: 'APPVEYOR_PULL_REQUEST_NUMBER',
  },
  {
    name: 'AWS CodeBuild',
    constant: 'CODEBUILD',
    env: 'CODEBUILD_BUILD_ARN',
  },
  {
    name: 'Azure Pipelines',
    constant: 'AZURE_PIPELINES',
    env: 'TF_BUILD',
    pr: {
      BUILD_REASON: 'PullRequest',
    },
  },
  {
    name: 'Bamboo',
    constant: 'BAMBOO',
    env: 'bamboo_planKey',
  },
  {
    name: 'Bitbucket Pipelines',
    constant: 'BITBUCKET',
    env: 'BITBUCKET_COMMIT',
    pr: 'BITBUCKET_PR_ID',
  },
  {
    name: 'Bitrise',
    constant: 'BITRISE',
    env: 'BITRISE_IO',
    pr: 'BITRISE_PULL_REQUEST',
  },
  {
    name: 'Buddy',
    constant: 'BUDDY',
    env: 'BUDDY_WORKSPACE_ID',
    pr: 'BUDDY_EXECUTION_PULL_REQUEST_ID',
  },
  {
    name: 'Buildkite',
    constant: 'BUILDKITE',
    env: 'BUILDKITE',
    pr: {
      env: 'BUILDKITE_PULL_REQUEST',
      ne: 'false',
    },
  },
  {
    name: 'CircleCI',
    constant: 'CIRCLE',
    env: 'CIRCLECI',
    pr: 'CIRCLE_PULL_REQUEST',
  },
  {
    name: 'Cirrus CI',
    constant: 'CIRRUS',
    env: 'CIRRUS_CI',
    pr: 'CIRRUS_PR',
  },
  {
    name: 'Codefresh',
    constant: 'CODEFRESH',
    env: 'CF_BUILD_ID',
    pr: {
      any: ['CF_PULL_REQUEST_NUMBER', 'CF_PULL_REQUEST_ID'],
    },
  },
  {
    name: 'Codemagic',
    constant: 'CODEMAGIC',
    env: 'CM_BUILD_ID',
    pr: 'CM_PULL_REQUEST',
  },
  {
    name: 'Codeship',
    constant: 'CODESHIP',
    env: {
      CI_NAME: 'codeship',
    },
  },
  {
    name: 'Drone',
    constant: 'DRONE',
    env: 'DRONE',
    pr: {
      DRONE_BUILD_EVENT: 'pull_request',
    },
  },
  {
    name: 'dsari',
    constant: 'DSARI',
    env: 'DSARI',
  },
  {
    name: 'Earthly',
    constant: 'EARTHLY',
    env: 'EARTHLY_CI',
  },
  {
    name: 'Expo Application Services',
    constant: 'EAS',
    env: 'EAS_BUILD',
  },
  {
    name: 'Gerrit',
    constant: 'GERRIT',
    env: 'GERRIT_PROJECT',
  },
  {
    name: 'Gitea Actions',
    constant: 'GITEA_ACTIONS',
    env: 'GITEA_ACTIONS',
  },
  {
    name: 'GitHub Actions',
    constant: 'GITHUB_ACTIONS',
    env: 'GITHUB_ACTIONS',
    pr: {
      GITHUB_EVENT_NAME: 'pull_request',
    },
  },
  {
    name: 'GitLab CI',
    constant: 'GITLAB',
    env: 'GITLAB_CI',
    pr: 'CI_MERGE_REQUEST_ID',
  },
  {
    name: 'GoCD',
    constant: 'GOCD',
    env: 'GO_PIPELINE_LABEL',
  },
  {
    name: 'Google Cloud Build',
    constant: 'GOOGLE_CLOUD_BUILD',
    env: 'BUILDER_OUTPUT',
  },
  {
    name: 'Harness CI',
    constant: 'HARNESS',
    env: 'HARNESS_BUILD_ID',
  },
  {
    name: 'Heroku',
    constant: 'HEROKU',
    env: {
      env: 'NODE',
      includes: '/app/.heroku/node/bin/node',
    },
  },
  {
    name: 'Hudson',
    constant: 'HUDSON',
    env: 'HUDSON_URL',
  },
  {
    name: 'Jenkins',
    constant: 'JENKINS',
    env: ['JENKINS_URL', 'BUILD_ID'],
    pr: {
      any: ['ghprbPullId', 'CHANGE_ID'],
    },
  },
  {
    name: 'LayerCI',
    constant: 'LAYERCI',
    env: 'LAYERCI',
    pr: 'LAYERCI_PULL_REQUEST',
  },
  {
    name: 'Magnum CI',
    constant: 'MAGNUM',
    env: 'MAGNUM',
  },
  {
    name: 'Netlify CI',
    constant: 'NETLIFY',
    env: 'NETLIFY',
    pr: {
      env: 'PULL_REQUEST',
      ne: 'false',
    },
  },
  {
    name: 'Nevercode',
    constant: 'NEVERCODE',
    env: 'NEVERCODE',
    pr: {
      env: 'NEVERCODE_PULL_REQUEST',
      ne: 'false',
    },
  },
  {
    name: 'Prow',
    constant: 'PROW',
    env: 'PROW_JOB_ID',
  },
  {
    name: 'ReleaseHub',
    constant: 'RELEASEHUB',
    env: 'RELEASE_BUILD_ID',
  },
  {
    name: 'Render',
    constant: 'RENDER',
    env: 'RENDER',
    pr: {
      IS_PULL_REQUEST: 'true',
    },
  },
  {
    name: 'Sail CI',
    constant: 'SAIL',
    env: 'SAILCI',
    pr: 'SAIL_PULL_REQUEST_NUMBER',
  },
  {
    name: 'Screwdriver',
    constant: 'SCREWDRIVER',
    env: 'SCREWDRIVER',
    pr: {
      env: 'SD_PULL_REQUEST',
      ne: 'false',
    },
  },
  {
    name: 'Semaphore',
    constant: 'SEMAPHORE',
    env: 'SEMAPHORE',
    pr: 'PULL_REQUEST_NUMBER',
  },
  {
    name: 'Sourcehut',
    constant: 'SOURCEHUT',
    env: {
      CI_NAME: 'sourcehut',
    },
  },
  {
    name: 'Strider CD',
    constant: 'STRIDER',
    env: 'STRIDER',
  },
  {
    name: 'TaskCluster',
    constant: 'TASKCLUSTER',
    env: ['TASK_ID', 'RUN_ID'],
  },
  {
    name: 'TeamCity',
    constant: 'TEAMCITY',
    env: 'TEAMCITY_VERSION',
  },
  {
    name: 'Travis CI',
    constant: 'TRAVIS',
    env: 'TRAVIS',
    pr: {
      env: 'TRAVIS_PULL_REQUEST',
      ne: 'false',
    },
  },
  {
    name: 'Vela',
    constant: 'VELA',
    env: 'VELA',
    pr: {
      VELA_PULL_REQUEST: '1',
    },
  },
  {
    name: 'Vercel',
    constant: 'VERCEL',
    env: {
      any: ['NOW_BUILDER', 'VERCEL'],
    },
    pr: 'VERCEL_GIT_PULL_REQUEST_ID',
  },
  {
    name: 'Visual Studio App Center',
    constant: 'APPCENTER',
    env: 'APPCENTER_BUILD_ID',
  },
  {
    name: 'Woodpecker',
    constant: 'WOODPECKER',
    env: {
      CI: 'woodpecker',
    },
    pr: {
      CI_BUILD_EVENT: 'pull_request',
    },
  },
  {
    name: 'Xcode Cloud',
    constant: 'XCODE_CLOUD',
    env: 'CI_XCODE_PROJECT',
    pr: 'CI_PULL_REQUEST_NUMBER',
  },
  {
    name: 'Xcode Server',
    constant: 'XCODE_SERVER',
    env: 'XCS',
  },
];

init(VENDORS);
