import { gql } from '@apollo/client';
import { getApolloClient } from 'lib/apollo-client';

const templates = {
  contentNode: {
    component: () => {
      return <>contentNode</>;
    },
    query: gql`
      query GetPostById($id: ID!) {
        __typename
        post(id: $id) {
          title
          date
          content
          author {
            node {
              name
            }
          }
        }
      }
    `,
    variables: (wordpressNode) => {
      console.log('wordpressNode', wordpressNode);
      return {
        id: wordpressNode.id,
      };
    },
  },
  index: {
    component: () => {
      return <>Index!</>;
    },
    query: gql`
      {
        __typename
      }
    `,
    variables: (wordpressNode) => {
      console.log('wordpressNode', wordpressNode);
      return wordpressNode;
    },
  },
};

export default function WordPressNode({ templateData }) {
  return (
    <div>
      <h1
        dangerouslySetInnerHTML={{
          __html: templateData.data.post.title,
        }}
      />
      <div
        dangerouslySetInnerHTML={{
          __html: templateData.data.post.content,
        }}
      />
    </div>
  );
}

export async function getStaticProps(context) {
  let resolvedUrl = null;
  let params = null;

  // console.log('context', context);

  if (context?.params?.wordpressNode) {
    params = context?.params ?? null;
    resolvedUrl = params?.wordpressNode ? params?.wordpressNode.join('/') : null;
  }

  // console.log('resolvedUrl', resolvedUrl);

  if (!resolvedUrl) {
    return {
      notFound: true,
    };
  }

  const apolloClient = getApolloClient();

  const data = await apolloClient.query({
    query: gql`
      query GetNodeByUri($uri: String!) {
        node: nodeByUri(uri: $uri) {
          ...NodeByUri
        }
      }

      fragment NodeByUri on UniformResourceIdentifiable {
        __typename
        uri
        id
        ...DatabaseIdentifier
        ...ContentType
        ...User
        ...TermNode
        ...ContentNode
        ...MediaItem
      }

      fragment DatabaseIdentifier on DatabaseIdentifier {
        databaseId
      }

      fragment MediaItem on MediaItem {
        id
        mimeType
      }

      fragment ContentType on ContentType {
        name
        isFrontPage
        isPostsPage
      }

      fragment TermNode on TermNode {
        isTermNode
        slug
        taxonomyName
      }

      fragment ContentNode on ContentNode {
        isContentNode
        slug
        contentType {
          node {
            name
          }
        }
        template {
          templateName
        }
      }

      fragment User on User {
        nicename
        databaseId
      }
    `,
    variables: {
      uri: resolvedUrl,
    },
  });

  if (!data?.data?.node) {
    return {
      notFound: true,
    };
  }

  let template;

  if (data.data.node.isContentNode) {
    template = templates.contentNode;
  } else {
    template = templates.index;
  }

  const templateData = await apolloClient.query({
    query: template.query,
    variables: template.variables(data.data.node),
  });

  console.log('data', data);
  console.log('templateData', templateData);

  return {
    props: {
      data,
      templateData,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}
