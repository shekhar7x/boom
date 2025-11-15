# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "Boom" [ref=e6] [cursor=pointer]:
        - /url: /
        - img [ref=e7]
        - generic [ref=e11]: Boom
      - navigation [ref=e12]:
        - link "Record" [ref=e13] [cursor=pointer]:
          - /url: /
          - img [ref=e14]
          - text: Record
        - link "My Videos" [ref=e17] [cursor=pointer]:
          - /url: /videos
          - img [ref=e18]
          - text: My Videos
  - main [ref=e21]:
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - heading "My Videos" [level=1] [ref=e26]
          - paragraph [ref=e27]: 0 videos recorded
        - link "New Recording" [ref=e28] [cursor=pointer]:
          - /url: /
          - button "New Recording" [ref=e29]:
            - img [ref=e31]
            - generic [ref=e33]: New Recording
      - generic [ref=e34]:
        - img [ref=e35]
        - heading "No videos yet" [level=2] [ref=e38]
        - paragraph [ref=e39]: Start recording to see your videos here
        - link "Start Recording" [ref=e40] [cursor=pointer]:
          - /url: /
          - button "Start Recording" [ref=e41]:
            - generic [ref=e42]: Start Recording
```