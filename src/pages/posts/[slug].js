import Link from 'next/link';
import { Helmet } from 'react-helmet';

import { getPostBySlug, getRecentPosts, getRelatedPosts, postPathBySlug } from 'lib/posts';
import { categoryPathBySlug } from 'lib/categories';
import { formatDate } from 'lib/datetime';
import { ArticleJsonLd } from 'lib/json-ld';
import { helmetSettingsFromMetadata } from 'lib/site';
import useSite from 'hooks/use-site';
import usePageMetadata from 'hooks/use-page-metadata';

import Layout from 'components/Layout';
import Header from 'components/Header';
import Section from 'components/Section';
import Container from 'components/Container';
import Content from 'components/Content';
import Metadata from 'components/Metadata';
import FeaturedImage from 'components/FeaturedImage';
import Post_Panels_Panels_PageHeader from 'components/Post_Panels_Panels_PageHeader';
import Post_Panels_Panels_FullWidthText from 'components/Post_Panels_Panels_FullWidthText';
import Post_Panels_Panels_PageContent from 'components/Post_Panels_Panels_PageContent';

import styles from 'styles/pages/Post.module.scss';

export default function Post({ post, socialImage, related, video, panels }) {
  const {
    title,
    metaTitle,
    description,
    content,
    date,
    author,
    categories,
    modified,
    featuredImage,
    isSticky = false,
  } = post;

  const { metadata: siteMetadata = {}, homepage } = useSite();

  if (!post.og) {
    post.og = {};
  }

  post.og.imageUrl = `${homepage}${socialImage}`;
  post.og.imageSecureUrl = post.og.imageUrl;
  post.og.imageWidth = 2000;
  post.og.imageHeight = 1000;

  const { metadata } = usePageMetadata({
    metadata: {
      ...post,
      title: metaTitle,
      description: description || post.og?.description || `Read more about ${title}`,
    },
  });

  if (process.env.WORDPRESS_PLUGIN_SEO !== true) {
    metadata.title = `${title} - ${siteMetadata.title}`;
    metadata.og.title = metadata.title;
    metadata.twitter.title = metadata.title;
  }

  const metadataOptions = {
    compactCategories: false,
  };

  const { posts: relatedPostsList, title: relatedPostsTitle } = related || {};

  const helmetSettings = helmetSettingsFromMetadata(metadata);

  return (
    <Layout>
      <Helmet {...helmetSettings} />

      <ArticleJsonLd post={post} siteTitle={siteMetadata.title} />

      <Header>
        {featuredImage && (
          <FeaturedImage
            {...featuredImage}
            src={featuredImage.sourceUrl}
            dangerouslySetInnerHTML={featuredImage.caption}
          />
        )}
        <h1
          className={styles.title}
          dangerouslySetInnerHTML={{
            __html: title,
          }}
        />
        <Metadata
          className={styles.postMetadata}
          date={date}
          author={author}
          categories={categories}
          options={metadataOptions}
          isSticky={isSticky}
        />
      </Header>

      <Content>
        <Section>
          <Container>
            {video?.oembed && (
              <div
                className={styles.video}
                dangerouslySetInnerHTML={{
                  __html: video.oembed.html,
                }}
              />
            )}
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />
          </Container>
        </Section>
        <Section>
          <Container>
            {panels &&
              post.panels.panels.map((panel) => {
                if (panel.fieldGroupName === 'Post_Panels_Panels_PageHeader') {
                  return <Post_Panels_Panels_PageHeader key={panel.fieldGroupName} panel={panel} />;
                }
                if (panel.fieldGroupName === 'Post_Panels_Panels_FullWidthText') {
                  return <Post_Panels_Panels_FullWidthText key={panel.fieldGroupName} panel={panel} />;
                }
                if (panel.fieldGroupName === 'Post_Panels_Panels_PageContent') {
                  return <Post_Panels_Panels_PageContent key={panel.fieldGroupName} panel={panel} />;
                }
                return (
                  <div key={panel.fieldGroupName} className={styles.panels}>
                    {panel.fieldGroupName}
                  </div>
                );
              })}
          </Container>
        </Section>
      </Content>

      <Section className={styles.postFooter}>
        <Container>
          <p className={styles.postModified}>Last updated on {formatDate(modified)}.</p>
          {Array.isArray(relatedPostsList) && relatedPostsList.length > 0 && (
            <div className={styles.relatedPosts}>
              {relatedPostsTitle.name ? (
                <span>
                  More from <Link href={relatedPostsTitle.link}>{relatedPostsTitle.name}</Link>
                </span>
              ) : (
                <span>More Posts</span>
              )}
              <ul>
                {relatedPostsList.map((post) => (
                  <li key={post.title}>
                    <Link href={postPathBySlug(post.slug)}>{post.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  );
}

export async function getStaticProps({ params = {} } = {}) {
  const { post } = await getPostBySlug(params?.slug);

  if (!post) {
    return {
      props: {},
      notFound: true,
    };
  }

  const { categories, databaseId: postId } = post;

  let oembed, panelLayouts;

  if (post.video) {
    if (post.video.videoSource === 'YouTube') {
      oembed = await fetch(`https://youtube.com/oembed?url=${post.video.videoUrl}`);
      oembed = await oembed.json();
    }
  }

  if (post.panels) {
    panelLayouts = post.panels.panels;
  }

  let props = {
    post,
    socialImage: `${process.env.OG_IMAGE_DIRECTORY}/${params?.slug}.png`,
  };

  if (oembed) {
    props = {
      ...props,
      video: {
        ...post.video,
        oembed,
      },
    };
  }
  if (panelLayouts) {
    props = {
      ...props,
      panels: {
        ...post.panels.panels,
      },
    };
  }

  const { category: relatedCategory, posts: relatedPosts } = (await getRelatedPosts(categories, postId)) || {};
  const hasRelated = relatedCategory && Array.isArray(relatedPosts) && relatedPosts.length;

  if (hasRelated) {
    props.related = {
      posts: relatedPosts,
      title: {
        name: relatedCategory.name || null,
        link: categoryPathBySlug(relatedCategory.slug),
      },
    };
  }

  return {
    props,
  };
}

export async function getStaticPaths() {
  // Only render the most recent posts to avoid spending unecessary time
  // querying every single post from WordPress

  // Tip: this can be customized to use data or analytitcs to determine the
  // most popular posts and render those instead

  const { posts } = await getRecentPosts({
    count: process.env.POSTS_PRERENDER_COUNT, // Update this value in next.config.js!
    queryIncludes: 'index',
  });

  const paths = posts
    .filter(({ slug }) => typeof slug === 'string')
    .map(({ slug }) => ({
      params: {
        slug,
      },
    }));

  return {
    paths,
    fallback: 'blocking',
  };
}
